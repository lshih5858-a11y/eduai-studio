"""
==============================================================================
Flask 웹 대시보드 서버 (app.py) — v3
==============================================================================
실행 방법:
    cd krx_quant
    python app.py
    # 또는
    cd /home/user/webapp && python -m krx_quant.app

접속 주소:
    http://localhost:5000

API 엔드포인트:
    GET  /                  대시보드 메인 페이지
    GET  /api/analyze       분석 실행 (market, top, max_stocks, fast 파라미터)
    GET  /api/health        헬스 체크
==============================================================================
"""

import sys
import os
import json
import logging
from datetime import datetime, timedelta

from flask import Flask, render_template, jsonify, request

# 프로젝트 루트를 sys.path에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── 데이터 수집 모듈 (v3) ─────────────────────────────────────────────────
from krx_quant.data.collector import (
    get_last_trading_date,
    n_trading_days_before,
    fetch_stock_list,
    fetch_fundamental_data,
    fetch_investor_trading,
    fetch_ohlcv_bulk,
)

# ── 스코어링 모듈 (v3) ───────────────────────────────────────────────────
from krx_quant.analysis.scorer import (
    calc_valuation_score,
    calc_supply_demand_score,
    calc_technical_score,
    combine_scores,
)

# ── 리포팅 모듈 ──────────────────────────────────────────────────────────
from krx_quant.output.reporter import save_csv, save_json, save_text_report

import pandas as pd
import numpy as np

# ── Flask 앱 초기화 ──────────────────────────────────────────────────────
app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static",
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# JSON 직렬화 유틸리티
# =============================================================================

def safe_json_val(obj):
    """NaN / Inf / numpy 타입을 JSON 직렬화 가능한 형태로 변환한다."""
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        v = float(obj)
        return None if (np.isnan(v) or np.isinf(v)) else round(v, 4)
    if isinstance(obj, float):
        return None if (np.isnan(obj) or np.isinf(obj)) else round(obj, 4)
    return obj


def df_to_safe_records(df: pd.DataFrame) -> list:
    """DataFrame을 JSON 안전한 레코드 리스트로 변환한다."""
    return [
        {k: safe_json_val(v) for k, v in row.items()}
        for row in df.to_dict(orient="records")
    ]


# =============================================================================
# 핵심 분석 파이프라인 (Flask용)
# =============================================================================

def run_analysis_pipeline(
    market: str = "ALL",
    top_n: int = 10,
    max_stocks: int = 300,
    fast_mode: bool = False,
) -> dict:
    """
    데이터 수집 → 스코어링 → 결과 반환 파이프라인.

    Parameters
    ----------
    market     : 분석 시장 (KOSPI | KOSDAQ | ALL)
    top_n      : 상위 종목 수
    max_stocks : OHLCV 수집 최대 종목 수
    fast_mode  : True이면 PBR·수급 수집 생략

    Returns
    -------
    dict : 분석 결과 딕셔너리
    """
    # ── 거래일 확인 ───────────────────────────────────────────────────────
    trading_date = get_last_trading_date()
    start_60d    = n_trading_days_before(trading_date, 70)

    # ── 종목 리스트 ───────────────────────────────────────────────────────
    stock_list = fetch_stock_list(market=market)
    stock_list = stock_list.sort_values("시가총액", ascending=False).reset_index(drop=True)
    code_list  = stock_list["Code"].tolist()

    # ── 기본지표 (PER, PBR, ROE) ─────────────────────────────────────────
    try:
        fund_df = fetch_fundamental_data(
            stock_codes=code_list,
            max_pages=60,
            fetch_pbr=(not fast_mode),
            max_pbr_codes=300 if not fast_mode else 0,
        )
    except Exception as e:
        logger.warning(f"기본지표 수집 실패: {e}")
        fund_df = pd.DataFrame()

    # ── 기관·외국인 순매수 ────────────────────────────────────────────────
    investor_df = pd.DataFrame()
    if not fast_mode:
        try:
            investor_df = fetch_investor_trading(
                codes=code_list,
                days=5,
                max_codes=max_stocks,
            )
        except Exception as e:
            logger.warning(f"수급 데이터 수집 실패: {e}")
            investor_df = pd.DataFrame()

    # ── OHLCV ─────────────────────────────────────────────────────────────
    try:
        ohlcv_dict = fetch_ohlcv_bulk(
            codes=code_list,
            start_date=start_60d,
            end_date=trading_date,
            max_codes=max_stocks,
        )
    except Exception as e:
        logger.warning(f"OHLCV 수집 실패: {e}")
        ohlcv_dict = {}

    # ── 스코어링 ──────────────────────────────────────────────────────────
    val_score  = (
        calc_valuation_score(fund_df)
        if not fund_df.empty
        else pd.Series(dtype=float).rename("valuation_score")
    )
    sd_score   = (
        calc_supply_demand_score(investor_df)
        if not investor_df.empty
        else pd.Series(dtype=float).rename("supply_demand_score")
    )
    tech_score = (
        calc_technical_score(ohlcv_dict)
        if ohlcv_dict
        else pd.Series(dtype=float).rename("tech_score")
    )

    top_df = combine_scores(
        stock_list_df=stock_list,
        val_score=val_score,
        sd_score=sd_score,
        tech_score=tech_score,
        fund_df=fund_df,
        investor_df=investor_df,
        top_n=top_n,
    )

    # ── 파일 저장 ─────────────────────────────────────────────────────────
    save_csv(top_df, trading_date)
    save_json(top_df, trading_date)
    save_text_report(top_df, trading_date)

    return {
        "trading_date":    trading_date,
        "market":          market,
        "fast_mode":       fast_mode,
        "total_analyzed":  len(stock_list),
        "generated_at":    datetime.now().isoformat(),
        "scores_available": {
            "valuation": not fund_df.empty,
            "supply_demand": not investor_df.empty,
            "technical": bool(ohlcv_dict),
        },
        "top_stocks": df_to_safe_records(top_df),
    }


# =============================================================================
# Flask 라우트
# =============================================================================

@app.route("/")
def index():
    """메인 대시보드 페이지"""
    return render_template("index.html")


@app.route("/api/analyze")
def api_analyze():
    """
    분석 API 엔드포인트

    GET /api/analyze?market=ALL&top=10&max_stocks=300&fast=0

    Parameters
    ----------
    market     : KOSPI | KOSDAQ | ALL (기본 ALL)
    top        : 상위 종목 수 (1~50, 기본 10)
    max_stocks : OHLCV 최대 종목 수 (기본 300)
    fast       : 1이면 빠른 모드 (PBR·수급 생략)

    Returns
    -------
    JSON : 분석 결과
    """
    market     = request.args.get("market",     "ALL")
    top_n      = int(request.args.get("top",       10))
    max_stocks = int(request.args.get("max_stocks", 300))
    fast_mode  = request.args.get("fast", "0") == "1"

    # 유효성 검사
    if market not in ("KOSPI", "KOSDAQ", "ALL"):
        return jsonify({"error": "market 파라미터는 KOSPI/KOSDAQ/ALL 중 하나여야 합니다."}), 400
    if top_n < 1 or top_n > 50:
        return jsonify({"error": "top 파라미터는 1~50 사이여야 합니다."}), 400

    try:
        result = run_analysis_pipeline(
            market=market,
            top_n=top_n,
            max_stocks=max_stocks,
            fast_mode=fast_mode,
        )
        return jsonify(result), 200

    except RuntimeError as e:
        err_str = str(e)
        if any(kw in err_str for kw in ["비어", "비거래", "empty", "None", "holiday"]):
            msg = (
                f"오늘은 장이 열리지 않거나 데이터가 아직 제공되지 않았습니다. "
                f"상세: {err_str}"
            )
        elif any(kw in err_str for kw in ["connection", "timeout", "network"]):
            msg = f"서버 연결 실패. 잠시 후 다시 시도하세요. 상세: {err_str}"
        else:
            msg = f"데이터 수집 오류: {err_str}"
        logger.error(f"API 오류: {msg}")
        return jsonify({"error": msg}), 503

    except Exception as e:
        logger.error(f"예상치 못한 오류: {e}", exc_info=True)
        return jsonify({"error": f"서버 내부 오류: {str(e)}"}), 500


@app.route("/api/health")
def api_health():
    """헬스 체크 엔드포인트"""
    return jsonify({
        "status": "ok",
        "version": "v3",
        "time": datetime.now().isoformat(),
    }), 200


# =============================================================================
# 서버 실행
# =============================================================================

if __name__ == "__main__":
    print()
    print("=" * 58)
    print("  🚀 KRX 퀀트 투자 스코어링 대시보드 v3 서버 시작")
    print("  🌐 접속: http://0.0.0.0:5000")
    print(f"  ⏱  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 58)
    print()
    app.run(host="0.0.0.0", port=5000, debug=False)
