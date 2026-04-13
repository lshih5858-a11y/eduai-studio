"""
==============================================================================
Flask 웹 대시보드 서버 (app.py)
==============================================================================
실행 방법:
    cd krx_quant
    python app.py

접속 주소:
    http://localhost:5000
==============================================================================
"""

import sys
import os
import json
import logging
from datetime import datetime, timedelta

from flask import Flask, render_template, jsonify, request

# 프로젝트 루트를 sys.path 에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from krx_quant.data.collector import (
  get_last_trading_date,
  fetch_stock_list,
  fetch_fundamental_data,
  fetch_investor_trading,
  fetch_ohlcv_bulk,
  fetch_market_cap,
)
from krx_quant.analysis.scorer import (
  calc_valuation_score,
  calc_momentum_score,
  calc_technical_score,
  combine_scores,
)
from krx_quant.output.reporter import save_csv, save_json, save_text_report

import pandas as pd
import numpy as np

# ── Flask 앱 초기화 ──────────────────────────────────────────────────────────
app = Flask(
  __name__,
  template_folder="templates",
  static_folder="static",
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# 유틸리티: pandas DataFrame → JSON 직렬화 안전 변환
# ─────────────────────────────────────────────────────────────────────────────

def safe_json(obj):
  """NaN / Inf / numpy 타입을 JSON 직렬화 가능한 형태로 변환한다."""
  if isinstance(obj, float):
    if obj != obj or obj == float("inf") or obj == float("-inf"):
      return None
    return round(obj, 4)
  if isinstance(obj, (np.integer,)):
    return int(obj)
  if isinstance(obj, (np.floating,)):
    v = float(obj)
    if v != v or v == float("inf") or v == float("-inf"):
      return None
    return round(v, 4)
  return obj


def df_to_safe_records(df: pd.DataFrame) -> list:
  """DataFrame을 JSON 안전한 레코드 리스트로 변환한다."""
  records = df.to_dict(orient="records")
  safe = []
  for row in records:
    safe_row = {k: safe_json(v) for k, v in row.items()}
    safe.append(safe_row)
  return safe


# ─────────────────────────────────────────────────────────────────────────────
# 핵심 분석 파이프라인 (Flask 용)
# ─────────────────────────────────────────────────────────────────────────────

def run_analysis_pipeline(market: str = "ALL", top_n: int = 10, max_stocks: int = 300):
  """
  데이터 수집 → 스코어링 전체 파이프라인을 실행하고
  결과 딕셔너리를 반환한다.
  """
  # ── 거래일 확인 ───────────────────────────────────────────────
  trading_date = get_last_trading_date()

  # 5거래일 전 계산
  def n_days_before(base: str, n: int) -> str:
    dt = datetime.strptime(base, "%Y%m%d")
    cnt = 0
    while cnt < n:
      dt -= timedelta(days=1)
      if dt.weekday() < 5:
        cnt += 1
    return dt.strftime("%Y%m%d")

  start_5d  = n_days_before(trading_date, 5)
  start_60d = n_days_before(trading_date, 70)

  # ── 종목 리스트 ───────────────────────────────────────────────
  stock_list = fetch_stock_list(market=market)
  code_list  = stock_list["Code"].tolist()

  # ── 기본지표 ──────────────────────────────────────────────────
  try:
    fund_df = fetch_fundamental_data(trading_date)
  except Exception as e:
    logger.warning(f"기본지표 수집 실패: {e}")
    fund_df = pd.DataFrame()

  # ── 수급 데이터 ───────────────────────────────────────────────
  try:
    investor_data = fetch_investor_trading(start_5d, trading_date)
  except Exception as e:
    logger.warning(f"수급 데이터 수집 실패: {e}")
    investor_data = {}

  # ── OHLCV ─────────────────────────────────────────────────────
  try:
    ohlcv_dict = fetch_ohlcv_bulk(code_list, start_60d, trading_date, max_codes=max_stocks)
  except Exception as e:
    logger.warning(f"OHLCV 수집 실패: {e}")
    ohlcv_dict = {}

  # ── 시가총액 ──────────────────────────────────────────────────
  try:
    market_cap_df = fetch_market_cap(trading_date)
  except Exception as e:
    logger.warning(f"시가총액 수집 실패: {e}")
    market_cap_df = pd.DataFrame()

  # ── 스코어링 ──────────────────────────────────────────────────
  val_score  = calc_valuation_score(fund_df)  if not fund_df.empty  else pd.Series(dtype=float).rename("valuation_score")
  mom_score  = calc_momentum_score(investor_data) if investor_data  else pd.Series(dtype=float).rename("momentum_score")
  tech_score = calc_technical_score(ohlcv_dict)   if ohlcv_dict    else pd.Series(dtype=float).rename("tech_score")

  top_df = combine_scores(
    stock_list_df=stock_list,
    val_score=val_score,
    mom_score=mom_score,
    tech_score=tech_score,
    fund_df=fund_df,
    market_cap_df=market_cap_df,
    top_n=top_n,
  )

  # ── 파일 저장 ─────────────────────────────────────────────────
  save_csv(top_df, trading_date)
  save_json(top_df, trading_date)
  save_text_report(top_df, trading_date)

  return {
    "trading_date":    trading_date,
    "market":          market,
    "total_analyzed":  len(stock_list),
    "generated_at":    datetime.now().isoformat(),
    "top10":           df_to_safe_records(top_df),
  }


# ─────────────────────────────────────────────────────────────────────────────
# Flask 라우트
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
  """메인 대시보드 페이지"""
  return render_template("index.html")


@app.route("/api/analyze")
def api_analyze():
  """
  분석 API 엔드포인트
  GET /api/analyze?market=ALL&top=10&max_stocks=300
  """
  market     = request.args.get("market",     "ALL")
  top_n      = int(request.args.get("top",       10))
  max_stocks = int(request.args.get("max_stocks", 300))

  # 유효성 검사
  if market not in ("KOSPI", "KOSDAQ", "ALL"):
    return jsonify({"error": "market 파라미터는 KOSPI/KOSDAQ/ALL 중 하나여야 합니다."}), 400
  if top_n < 1 or top_n > 50:
    return jsonify({"error": "top 파라미터는 1~50 사이여야 합니다."}), 400

  try:
    result = run_analysis_pipeline(market=market, top_n=top_n, max_stocks=max_stocks)
    return jsonify(result), 200

  except RuntimeError as e:
    # 비거래일·네트워크 오류 등 예상된 오류
    err_str = str(e)
    if any(kw in err_str for kw in ["비어", "비거래", "empty", "None"]):
      msg = (f"오늘은 장이 열리지 않거나 데이터가 아직 제공되지 않았습니다. "
             f"상세: {err_str}")
    elif any(kw in err_str for kw in ["connection", "timeout", "network"]):
      msg = f"KRX 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요. 상세: {err_str}"
    else:
      msg = f"데이터 수집 중 오류가 발생했습니다: {err_str}"
    logger.error(f"API 오류: {msg}")
    return jsonify({"error": msg}), 503

  except Exception as e:
    logger.error(f"예상치 못한 오류: {e}", exc_info=True)
    return jsonify({"error": f"서버 내부 오류: {str(e)}"}), 500


@app.route("/api/health")
def api_health():
  """헬스 체크 엔드포인트"""
  return jsonify({"status": "ok", "time": datetime.now().isoformat()}), 200


# ─────────────────────────────────────────────────────────────────────────────
# 서버 실행
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
  print()
  print("=" * 55)
  print("  🚀 KRX 퀀트 투자 스코어링 대시보드 서버 시작")
  print("  🌐 접속 주소: http://0.0.0.0:5000")
  print("  ⏱  " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
  print("=" * 55)
  print()
  app.run(host="0.0.0.0", port=5000, debug=False)
