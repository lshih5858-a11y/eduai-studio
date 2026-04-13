"""
================================================================================
 KRX 퀀트 투자 스코어링 시스템 — 완전 통합 단일 파일 버전
================================================================================
 작성자  : 퀀트 인베스트먼트 전문가 + Python 수석 엔지니어
 버전    : 1.0.0
 최종수정: 2025-04-13

 ■ 사용 방법 (터미널에서 실행)
   python krx_quant_all_in_one.py
   python krx_quant_all_in_one.py --date 20240315    # 특정 날짜 지정
   python krx_quant_all_in_one.py --market KOSPI     # KOSPI만 분석
   python krx_quant_all_in_one.py --top 20           # 상위 20개 선정
   python krx_quant_all_in_one.py --max-stocks 500   # 최대 500개 종목 OHLCV

 ■ 필수 라이브러리 설치 (처음 한 번만 실행)
   pip install finance-datareader pykrx pandas numpy tabulate colorama requests

================================================================================

■ CoT (단계적 사고) 설계 개요
─────────────────────────────────────────────────────────────────────────────
[1단계] 데이터 수집 및 전처리
  1-1. pykrx / FinanceDataReader 로 KRX 전체 종목 리스트 수집
  1-2. pykrx.get_market_fundamental() 으로 PER, PBR 수집
  1-3. pykrx.get_market_trading_value_by_ticker() 로 기관·외국인 5일 순매수 수집
  1-4. pykrx.get_market_ohlcv() 로 60일치 OHLCV(종가, 거래량) 수집
  1-5. 공휴일·비거래일·네트워크 오류 예외 처리

[2단계] 종목 필터링 및 스코어링(점수화)
  ┌─────────────────────────────────────────────────────────────────┐
  │  지표          │ 배점  │ 산정 방식                              │
  ├─────────────────────────────────────────────────────────────────┤
  │ 저평가 (PER)   │ 20점  │ 전체 종목 내 하위 백분위 → 선형 점수화 │
  │ 저평가 (PBR)   │ 20점  │ 전체 종목 내 하위 백분위 → 선형 점수화 │
  │ 수급 (기관)    │ 20점  │ 5일 순매수 상위 백분위 → 선형 점수화  │
  │ 수급 (외국인)  │ 20점  │ 5일 순매수 상위 백분위 → 선형 점수화  │
  │ 기술 (거래량)  │ 10점  │ 5일평균/20일평균 ≥ 1.5배 → 10점 부여  │
  │ 기술 (이동평균)│ 10점  │ 5MA>20MA>60MA 정배열 → 10점 부여     │
  ├─────────────────────────────────────────────────────────────────┤
  │ 합계           │100점  │                                        │
  └─────────────────────────────────────────────────────────────────┘

[3단계] 최종 출력
  3-1. 컬러 테이블 터미널 출력 (tabulate + colorama)
  3-2. CSV, JSON, TXT 파일 저장 (output/ 디렉토리)
  3-3. 예외 상황 알림 메시지 출력

================================================================================
"""

# ══════════════════════════════════════════════════════════════════════════════
# 표준 라이브러리
# ══════════════════════════════════════════════════════════════════════════════
import os
import sys
import json
import time
import logging
import argparse
import traceback
from pathlib import Path
from datetime import datetime, timedelta

# ══════════════════════════════════════════════════════════════════════════════
# 서드파티 라이브러리
# ══════════════════════════════════════════════════════════════════════════════
try:
  import numpy as np
  import pandas as pd
  import FinanceDataReader as fdr
  from pykrx import stock as krx_stock
  from tabulate import tabulate
  from colorama import Fore, Style, Back, init as colorama_init
  colorama_init(autoreset=True)  # Windows 호환 초기화
except ImportError as e:
  print(f"\n❌ 필수 라이브러리가 설치되지 않았습니다: {e}")
  print("  아래 명령어를 실행한 후 다시 시도해 주세요:")
  print("  pip install finance-datareader pykrx pandas numpy tabulate colorama requests\n")
  sys.exit(1)

# ══════════════════════════════════════════════════════════════════════════════
# 로거 설정
# ══════════════════════════════════════════════════════════════════════════════
logging.basicConfig(
  level=logging.INFO,
  format="%(asctime)s [%(levelname)s] %(message)s",
  datefmt="%Y-%m-%d %H:%M:%S",
  handlers=[
    logging.StreamHandler(sys.stdout),
    logging.FileHandler("krx_quant_run.log", mode="a", encoding="utf-8"),
  ],
)
logger = logging.getLogger("KRX_QUANT")

# 출력 디렉토리 생성
OUTPUT_DIR = Path("./output")
OUTPUT_DIR.mkdir(exist_ok=True)


# ──────────────────────────────────────────────────────────────────────────────
#  ██████╗  █████╗ ████████╗ █████╗      ██████╗ ██████╗ ██╗     ██╗
#  ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗    ██╔════╝██╔═══██╗██║     ██║
#  ██║  ██║███████║   ██║   ███████║    ██║     ██║   ██║██║     ██║
#  ██║  ██║██╔══██║   ██║   ██╔══██║    ██║     ██║   ██║██║     ██║
#  ██████╔╝██║  ██║   ██║   ██║  ██║    ╚██████╗╚██████╔╝███████╗███████╗
#  ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝     ╚═════╝ ╚═════╝ ╚══════╝╚══════╝
#  [1단계] 데이터 수집 모듈
# ──────────────────────────────────────────────────────────────────────────────

def get_last_trading_date() -> str:
  """
  KRX에서 가장 최근 실제 거래일을 자동으로 탐지한다.

  삼성전자(005930)를 기준 종목으로 사용하여
  최근 30일 내 실제로 데이터가 존재하는 마지막 날짜를 반환한다.

  Returns
  -------
  str : 최근 거래일 (YYYYMMDD 형식)

  Raises
  ------
  RuntimeError : 거래일을 탐지할 수 없을 때 발생 (공휴일 연속 등)
  """
  today          = datetime.today().strftime("%Y%m%d")
  one_month_ago  = (datetime.today() - timedelta(days=30)).strftime("%Y%m%d")
  try:
    # 삼성전자 기준 OHLCV 조회
    df = krx_stock.get_market_ohlcv(one_month_ago, today, "005930")
    if df is None or df.empty:
      raise ValueError("삼성전자 데이터가 비어 있음 — 비거래일 또는 연결 오류")
    last_date = df.index[-1].strftime("%Y%m%d")
    logger.info(f"✅ 최근 거래일 확인: {last_date}")
    return last_date
  except Exception as e:
    raise RuntimeError(
      f"최근 거래일을 확인할 수 없습니다. 오류: {e}\n"
      "  → 공휴일이거나 장 개시 전일 수 있습니다. --date 옵션으로 직접 지정해 보세요."
    )


def n_trading_days_before(base_date: str, n: int) -> str:
  """
  base_date 로부터 n 거래일(주말 제외) 이전 날짜를 반환한다.

  Parameters
  ----------
  base_date : str  기준일 (YYYYMMDD)
  n         : int  역산할 거래일 수

  Returns
  -------
  str : n 거래일 이전 날짜 (YYYYMMDD)
  """
  dt = datetime.strptime(base_date, "%Y%m%d")
  count = 0
  while count < n:
    dt   -= timedelta(days=1)
    if dt.weekday() < 5:   # 월(0) ~ 금(4)만 카운트
      count += 1
  return dt.strftime("%Y%m%d")


def fetch_stock_list(market: str = "ALL") -> pd.DataFrame:
  """
  KRX 전체(또는 특정) 시장의 종목 리스트를 수집한다.

  FinanceDataReader.StockListing() 을 사용하며,
  ETF·ETN·우선주(코드 마지막 자리 ≠ 0)는 제외한다.

  Parameters
  ----------
  market : str  "KOSPI", "KOSDAQ", "ALL" 중 하나

  Returns
  -------
  pd.DataFrame  columns = ["Code", "Name", "Market"]
  """
  logger.info(f"📋 종목 리스트 수집 중... (시장: {market})")
  try:
    if market == "ALL":
      # KOSPI + KOSDAQ 합산
      df_k = fdr.StockListing("KOSPI")[["Code", "Name"]].copy()
      df_d = fdr.StockListing("KOSDAQ")[["Code", "Name"]].copy()
      df_k["Market"] = "KOSPI"
      df_d["Market"] = "KOSDAQ"
      df = pd.concat([df_k, df_d], ignore_index=True)
    else:
      df = fdr.StockListing(market)[["Code", "Name"]].copy()
      df["Market"] = market

    # 종목코드 6자리 zero-padding
    df["Code"] = df["Code"].astype(str).str.zfill(6)

    # 보통주만 필터 (코드 마지막 자리 = '0')
    # 우선주(코드 끝: 5), ETF(코드: 1~9로 시작하는 6자리 제외) 등 제거
    df = df[df["Code"].str[-1] == "0"].reset_index(drop=True)

    logger.info(f"✅ 종목 리스트: {len(df)}개 종목 (보통주 기준)")
    return df

  except Exception as e:
    logger.error(f"❌ 종목 리스트 수집 실패: {e}")
    raise RuntimeError(f"종목 리스트 수집 오류: {e}")


def fetch_fundamental_data(trading_date: str) -> pd.DataFrame:
  """
  KRX 전 종목 기본지표(PER, PBR, EPS, BPS, 배당수익률)를 수집한다.

  pykrx.get_market_fundamental() 사용.
  비거래일에는 빈 DataFrame 이 반환될 수 있음.

  Parameters
  ----------
  trading_date : str  기준일 (YYYYMMDD)

  Returns
  -------
  pd.DataFrame  index = 종목코드(6자리)
                columns = [PER, PBR, EPS, BPS, DIV, DPS]

  Raises
  ------
  RuntimeError : 데이터가 비어 있을 때 (비거래일 등)
  """
  logger.info(f"📊 기본지표(PER/PBR) 수집 중... (기준일: {trading_date})")
  try:
    df = krx_stock.get_market_fundamental(trading_date, market="ALL")
    if df is None or df.empty:
      raise ValueError(
        "기본지표 데이터가 비어 있습니다. "
        "비거래일(공휴일·주말)이거나 아직 당일 데이터가 확정되지 않았을 수 있습니다."
      )
    # 인덱스(종목코드) 6자리 정규화
    df.index = df.index.astype(str).str.zfill(6)
    logger.info(f"✅ 기본지표 수집: {len(df)}개 종목")
    return df
  except Exception as e:
    raise RuntimeError(f"기본지표 수집 오류: {e}")


def fetch_investor_trading(start_date: str, end_date: str) -> dict:
  """
  KOSPI·KOSDAQ 시장 전체 기관/외국인 순매수 금액을 수집한다.

  pykrx.get_market_trading_value_by_ticker() 사용.
  start_date ~ end_date 기간의 누적 순매수 금액.

  Parameters
  ----------
  start_date : str  시작일 (YYYYMMDD)
  end_date   : str  종료일 (YYYYMMDD)

  Returns
  -------
  dict  {
    "KOSPI" : DataFrame (index=종목코드, columns=[기관합계, 외국인합계]),
    "KOSDAQ": DataFrame (index=종목코드, columns=[기관합계, 외국인합계])
  }
  """
  logger.info(f"🏦 기관/외국인 순매수 수집 중... ({start_date} ~ {end_date})")
  result = {}

  for market in ["KOSPI", "KOSDAQ"]:
    try:
      # 시장별 투자자 유형별 순매수 금액 합산
      df = krx_stock.get_market_trading_value_by_ticker(start_date, end_date, market)

      if df is None or df.empty:
        logger.warning(f"⚠️ {market} 수급 데이터 없음")
        result[market] = pd.DataFrame()
        continue

      df.index = df.index.astype(str).str.zfill(6)

      # 기관합계·외국인합계 컬럼 자동 탐지
      inst_col = next((c for c in df.columns if "기관" in c and "합계" in c), None)
      fore_col = next(
        (c for c in df.columns
         if ("외국인" in c and "합계" in c) or c == "외국인"),
        None
      )

      if inst_col is None or fore_col is None:
        # 컬럼 탐지 실패 시 숫자형 컬럼 앞 2개 사용 (대체 로직)
        num_cols = df.select_dtypes(include="number").columns.tolist()
        if len(num_cols) >= 2:
          inst_col, fore_col = num_cols[0], num_cols[1]
          logger.warning(
            f"⚠️ {market} 컬럼 자동 탐지 실패 → 대체 컬럼 사용: {inst_col}, {fore_col}"
          )
        else:
          logger.warning(f"⚠️ {market} 사용 가능한 숫자 컬럼 부족")
          result[market] = pd.DataFrame()
          continue

      df_sub = df[[inst_col, fore_col]].copy()
      df_sub.columns = ["기관합계", "외국인합계"]
      result[market] = df_sub
      logger.info(f"  ✅ {market} 수급: {len(df_sub)}개 종목")

    except Exception as e:
      logger.warning(f"⚠️ {market} 수급 수집 실패: {e}")
      result[market] = pd.DataFrame()

  return result


def fetch_ohlcv_bulk(
  codes: list,
  start_date: str,
  end_date: str,
  max_codes: int = 300,
  sleep_sec: float = 0.05,
) -> dict:
  """
  여러 종목의 OHLCV 데이터를 순차 수집한다.

  pykrx.get_market_ohlcv() 를 종목별로 호출하며,
  API 서버 부하 방지를 위해 sleep_sec 간격을 둔다.

  Parameters
  ----------
  codes      : 수집할 종목코드 리스트
  start_date : 수집 시작일 (YYYYMMDD)
  end_date   : 수집 종료일 (YYYYMMDD)
  max_codes  : 최대 수집 종목 수 (기본 300개)
  sleep_sec  : 호출 간 딜레이(초)

  Returns
  -------
  dict  {종목코드 (str): OHLCV DataFrame}
  """
  target = codes[:max_codes]
  logger.info(f"📈 OHLCV 수집 시작: {len(target)}개 종목 ({start_date}~{end_date})")
  result = {}

  for i, code in enumerate(target):
    try:
      df = krx_stock.get_market_ohlcv(start_date, end_date, code)
      if df is not None and not df.empty:
        result[code] = df
    except Exception:
      pass  # 개별 종목 오류는 조용히 스킵

    if (i + 1) % 50 == 0:
      logger.info(f"  ↳ 진행: {i+1}/{len(target)} 종목 처리 완료")

    time.sleep(sleep_sec)

  logger.info(f"✅ OHLCV 수집 완료: {len(result)}/{len(target)}개 성공")
  return result


def fetch_market_cap(trading_date: str) -> pd.DataFrame:
  """
  전 종목 시가총액 데이터를 수집한다.

  Parameters
  ----------
  trading_date : str  기준일 (YYYYMMDD)

  Returns
  -------
  pd.DataFrame  index = 종목코드, 시가총액 컬럼 포함
  """
  logger.info(f"💰 시가총액 수집 중... (기준일: {trading_date})")
  try:
    df = krx_stock.get_market_cap(trading_date, market="ALL")
    if df is None or df.empty:
      return pd.DataFrame()
    df.index = df.index.astype(str).str.zfill(6)
    logger.info(f"✅ 시가총액 수집: {len(df)}개 종목")
    return df
  except Exception as e:
    logger.warning(f"⚠️ 시가총액 수집 실패: {e}")
    return pd.DataFrame()


# ──────────────────────────────────────────────────────────────────────────────
#  ███████╗ ██████╗ ██████╗ ██████╗ ███████╗██████╗
#  ██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗
#  ███████╗██║     ██║   ██║██████╔╝█████╗  ██████╔╝
#  ╚════██║██║     ██║   ██║██╔══██╗██╔══╝  ██╔══██╗
#  ███████║╚██████╗╚██████╔╝██║  ██║███████╗██║  ██║
#  ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
#  [2단계] 스코어링 모듈
# ──────────────────────────────────────────────────────────────────────────────

def percentile_score(series: pd.Series, higher_is_better: bool = False) -> pd.Series:
  """
  수치 시리즈를 0~100 백분위 점수로 변환한다.

  Parameters
  ----------
  series          : 점수화 대상 수치 시리즈
  higher_is_better: True → 값이 클수록 고점수 / False → 값이 작을수록 고점수

  Returns
  -------
  pd.Series  (0.0 ~ 100.0 사이 점수)

  Example
  -------
  >>> s = pd.Series([10, 20, 30, 40, 50])
  >>> percentile_score(s, higher_is_better=False)
  # → [100, 80, 60, 40, 20] (낮을수록 고점)
  """
  rank = series.rank(method="average", na_option="bottom")
  n    = series.notna().sum()
  if n == 0:
    return pd.Series(0.0, index=series.index)
  pct = (rank / n) * 100
  if not higher_is_better:
    pct = 100 - pct      # 낮을수록 좋으면 점수 역전
  return pct.clip(0, 100)


def calc_valuation_score(fund_df: pd.DataFrame, max_score: float = 40.0) -> pd.Series:
  """
  [지표 1] 저평가 점수 계산 (최대 40점)

  ┌───────────────────────────────────────────────────────────┐
  │  PER 20점: 전체 종목 대비 낮을수록(저평가) → 고점수        │
  │  PBR 20점: 전체 종목 대비 낮을수록(자산 대비 저평가) 고점수  │
  │                                                           │
  │  제외 조건:                                               │
  │  - PER ≤ 0 (적자 기업, 신뢰성 없음)                       │
  │  - PER > 200 (극단적 고PER, 버블 가능성)                   │
  │  - PBR ≤ 0, PBR > 20 (극단값 제외)                        │
  └───────────────────────────────────────────────────────────┘

  Parameters
  ----------
  fund_df   : fetch_fundamental_data() 반환 DataFrame
  max_score : 최대 배점 (기본 40점, PER 20점 + PBR 20점)

  Returns
  -------
  pd.Series  index=종목코드, values=저평가점수(0 ~ max_score)
  """
  logger.info("📐 [지표1] 저평가 점수 계산 중...")

  # ── PER 전처리 ──────────────────────────────────────────────────────────
  if "PER" in fund_df.columns:
    per = fund_df["PER"].copy().astype(float)
    per[per <= 0]   = np.nan    # 적자 기업 제외
    per[per > 200]  = np.nan    # 극단적 고PER 제외 (200배 초과)
  else:
    per = pd.Series(np.nan, index=fund_df.index)

  # ── PBR 전처리 ──────────────────────────────────────────────────────────
  if "PBR" in fund_df.columns:
    pbr = fund_df["PBR"].copy().astype(float)
    pbr[pbr <= 0]   = np.nan    # 음수 자본 기업 제외
    pbr[pbr > 20]   = np.nan    # 극단적 고PBR 제외
  else:
    pbr = pd.Series(np.nan, index=fund_df.index)

  # ── 백분위 점수 변환 (낮을수록 저평가 → 고점수) ────────────────────────
  half = max_score / 2 / 100    # 점수 스케일 인수
  per_score = percentile_score(per, higher_is_better=False) * half
  pbr_score = percentile_score(pbr, higher_is_better=False) * half

  # 두 점수 합산
  combined_idx  = per_score.index.union(pbr_score.index)
  val_score = (
    per_score.reindex(combined_idx).fillna(0)
    + pbr_score.reindex(combined_idx).fillna(0)
  )

  logger.info(f"  ✅ 저평가 점수: {val_score.notna().sum()}개 종목")
  return val_score.rename("valuation_score")


def calc_momentum_score(investor_data: dict, max_score: float = 40.0) -> pd.Series:
  """
  [지표 2] 기관·외국인 수급 점수 계산 (최대 40점)

  ┌───────────────────────────────────────────────────────────┐
  │  기관 순매수 20점: 5거래일 기관 순매수 금액 상위 → 고점수   │
  │  외국인 순매수 20점: 5거래일 외국인 순매수 금액 상위 → 고점수│
  │                                                           │
  │  의미: 기관/외국인의 적극적 매수는 해당 종목에 대한        │
  │        전문 투자자의 긍정적 평가를 반영함                  │
  └───────────────────────────────────────────────────────────┘

  Parameters
  ----------
  investor_data : fetch_investor_trading() 반환 딕셔너리
  max_score     : 최대 배점 (기본 40점)

  Returns
  -------
  pd.Series  index=종목코드, values=수급점수(0 ~ max_score)
  """
  logger.info("💹 [지표2] 수급 점수 계산 중...")

  # KOSPI + KOSDAQ 합산
  frames = [df for df in investor_data.values() if df is not None and not df.empty]
  if not frames:
    logger.warning("⚠️ 수급 데이터 없음 → 전체 0점 처리")
    return pd.Series(dtype=float).rename("momentum_score")

  merged = pd.concat(frames)
  merged = merged.groupby(merged.index).sum()  # 중복 종목코드 합산

  cols = merged.columns.tolist()
  inst_col = next((c for c in cols if "기관" in c), None)
  fore_col = next((c for c in cols if "외국인" in c), None)

  if not inst_col or not fore_col:
    logger.warning(f"⚠️ 수급 컬럼 탐지 실패 → 0점 처리 (컬럼 목록: {cols[:4]})")
    return pd.Series(dtype=float).rename("momentum_score")

  half = max_score / 2 / 100
  inst_score = percentile_score(merged[inst_col], higher_is_better=True) * half
  fore_score = percentile_score(merged[fore_col], higher_is_better=True) * half

  mom_score = inst_score.add(fore_score, fill_value=0)
  logger.info(f"  ✅ 수급 점수: {mom_score.notna().sum()}개 종목")
  return mom_score.rename("momentum_score")


def calc_technical_score(
  ohlcv_dict: dict,
  max_score: float = 20.0,
  vol_ratio_threshold: float = 1.5,
  ma_windows: tuple = (5, 20, 60),
) -> pd.Series:
  """
  [지표 3] 거래량·이동평균 기술적 점수 계산 (최대 20점)

  ┌────────────────────────────────────────────────────────────┐
  │  거래량 급증 (10점)                                         │
  │  → 최근 5일 평균 거래량 / 직전 5~25일 평균 거래량 ≥ 1.5배   │
  │  → 의미: 단기 폭발적 관심 증가, 모멘텀 발생 신호            │
  │                                                            │
  │  이동평균 정배열 (10점)                                     │
  │  → 5일MA > 20일MA > 60일MA                                 │
  │  → 의미: 단기→중기→장기 모두 상승 추세 확인                 │
  └────────────────────────────────────────────────────────────┘

  Parameters
  ----------
  ohlcv_dict          : {종목코드: OHLCV DataFrame}
  max_score           : 최대 배점 (기본 20점)
  vol_ratio_threshold : 거래량 급증 기준 비율 (기본 1.5배)
  ma_windows          : 이동평균 기간 튜플 (5, 20, 60)

  Returns
  -------
  pd.Series  index=종목코드, values=기술점수(0, 10, 20)
  """
  logger.info("📊 [지표3] 기술적 점수 계산 중...")
  ma5, ma20, ma60 = ma_windows
  half = max_score / 2       # 10점 단위
  tech_scores = {}

  for code, df in ohlcv_dict.items():
    score = 0.0

    # ── 컬럼 탐지 ─────────────────────────────────────────────────────
    # 거래량 컬럼: '거래량' 또는 'Volume'
    vol_col = next(
      (c for c in df.columns if "거래량" in c or c.lower() == "volume"), None
    )
    # 종가 컬럼: '종가' 또는 'Close'
    close_col = next(
      (c for c in df.columns if "종가" in c or c.lower() == "close"), None
    )

    # 데이터 부족 또는 컬럼 없으면 0점 처리
    if vol_col is None or close_col is None or len(df) < ma60:
      tech_scores[code] = 0.0
      continue

    close  = df[close_col].astype(float)
    volume = df[vol_col].astype(float)

    # ── 거래량 급증 체크 ───────────────────────────────────────────────
    #  최근 5일 vs 직전 20일 (5~25일 전) 평균 비교
    recent_avg   = volume.iloc[-5:].mean()
    baseline_avg = volume.iloc[-25:-5].mean()

    if baseline_avg > 0 and not np.isnan(baseline_avg):
      vol_ratio = recent_avg / baseline_avg
      if vol_ratio >= vol_ratio_threshold:
        score += half   # 10점 (20점 만점 기준)

    # ── 이동평균 정배열 체크 ──────────────────────────────────────────
    #  5일MA > 20일MA > 60일MA 이면 정배열 (상승 추세 확인)
    ma5_val  = close.rolling(window=ma5).mean().iloc[-1]
    ma20_val = close.rolling(window=ma20).mean().iloc[-1]
    ma60_val = close.rolling(window=ma60).mean().iloc[-1]

    if (
      pd.notna(ma5_val) and pd.notna(ma20_val) and pd.notna(ma60_val)
      and ma5_val > ma20_val > ma60_val   # 정배열 조건
    ):
      score += half   # 10점

    tech_scores[code] = score

  result = pd.Series(tech_scores).rename("tech_score")
  logger.info(f"  ✅ 기술적 점수: {len(result)}개 종목 완료")
  return result


def combine_scores(
  stock_list_df: pd.DataFrame,
  val_score: pd.Series,
  mom_score: pd.Series,
  tech_score: pd.Series,
  fund_df: pd.DataFrame,
  market_cap_df: pd.DataFrame,
  top_n: int = 10,
) -> pd.DataFrame:
  """
  3가지 점수(저평가 + 수급 + 기술)를 합산하여 상위 top_n 개 종목을 반환한다.

  ■ 점수 구성 (100점 만점)
    저평가(40) + 수급(40) + 기술(20) = 100점

  Parameters
  ----------
  stock_list_df : 종목 리스트 DataFrame (Code, Name, Market)
  val_score     : 저평가 점수 Series
  mom_score     : 수급 점수 Series
  tech_score    : 기술적 점수 Series
  fund_df       : 기본지표 DataFrame (PER, PBR)
  market_cap_df : 시가총액 DataFrame
  top_n         : 선정 종목 수

  Returns
  -------
  pd.DataFrame  순위·종목코드·종목명·시장·세부점수·PER·PBR·시가총액 포함
  """
  logger.info(f"🏆 종합 점수 합산 → 상위 {top_n}개 종목 선정 중...")

  # 종목코드를 인덱스로 설정
  base = stock_list_df.set_index("Code")[["Name", "Market"]].copy()

  # 각 점수 결합 (좌측 조인: 종목 리스트 기준)
  base = base.join(val_score.rename("valuation_score"),  how="left")
  base = base.join(mom_score.rename("momentum_score"),   how="left")
  base = base.join(tech_score.rename("tech_score"),      how="left")

  # 결측값 → 0점 (데이터 없으면 0점 부여)
  base[["valuation_score", "momentum_score", "tech_score"]] = (
    base[["valuation_score", "momentum_score", "tech_score"]].fillna(0)
  )

  # ── 총점 계산 ────────────────────────────────────────────────────────
  base["total_score"] = (
    base["valuation_score"]
    + base["momentum_score"]
    + base["tech_score"]
  )

  # ── 기본지표(PER, PBR) 추가 ─────────────────────────────────────────
  if not fund_df.empty:
    for col in ["PER", "PBR", "EPS", "BPS"]:
      if col in fund_df.columns:
        base = base.join(fund_df[[col]], how="left")

  # ── 시가총액 추가 ─────────────────────────────────────────────────────
  if not market_cap_df.empty:
    cap_col = next(
      (c for c in market_cap_df.columns if "시가총액" in c or "cap" in c.lower()),
      None,
    )
    if cap_col:
      base = base.join(market_cap_df[[cap_col]].rename(columns={cap_col: "시가총액"}), how="left")

  # ── 유효 종목만 필터 (총점 > 0) ─────────────────────────────────────
  scored = base[base["total_score"] > 0].copy()

  # ── 총점 내림차순 정렬 → 상위 top_n 선정 ─────────────────────────────
  top_df = (
    scored
    .sort_values("total_score", ascending=False)
    .head(top_n)
    .reset_index()
    .rename(columns={"Code": "종목코드", "Name": "종목명"})
  )

  # 순위 컬럼 삽입
  top_df.insert(0, "순위", range(1, len(top_df) + 1))

  logger.info(f"✅ 상위 {len(top_df)}개 종목 선정 완료!")
  return top_df


# ──────────────────────────────────────────────────────────────────────────────
#   ██████╗ ██╗   ██╗████████╗██████╗ ██╗   ██╗████████╗
#  ██╔═══██╗██║   ██║╚══██╔══╝██╔══██╗██║   ██║╚══██╔══╝
#  ██║   ██║██║   ██║   ██║   ██████╔╝██║   ██║   ██║
#  ██║   ██║██║   ██║   ██║   ██╔═══╝ ██║   ██║   ██║
#  ╚██████╔╝╚██████╔╝   ██║   ██║     ╚██████╔╝   ██║
#   ╚═════╝  ╚═════╝    ╚═╝   ╚═╝      ╚═════╝    ╚═╝
#  [3단계] 출력 및 저장 모듈
# ──────────────────────────────────────────────────────────────────────────────

def print_console_report(top_df: pd.DataFrame, trading_date: str):
  """
  선정된 상위 종목을 터미널에 컬러 테이블로 출력한다.

  tabulate 라이브러리로 fancy_grid 형태 출력.
  colorama 로 ANSI 컬러 적용.
  """
  fmt_date = f"{trading_date[:4]}-{trading_date[4:6]}-{trading_date[6:]}"

  # ── 헤더 배너 출력 ────────────────────────────────────────────────────
  print()
  print(Fore.CYAN + Style.BRIGHT + "═" * 76)
  print(Fore.CYAN + Style.BRIGHT + "  🇰🇷  KRX 퀀트 투자 스코어링 시스템")
  print(Fore.CYAN + Style.BRIGHT + "       투자 가치 높은 상위 종목 선정 결과")
  print(Fore.CYAN + Style.BRIGHT + f"  📅  기준일: {fmt_date}  |  분석 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
  print(Fore.CYAN + Style.BRIGHT + "═" * 76)

  # ── 출력할 컬럼 준비 ─────────────────────────────────────────────────
  disp_df = top_df.copy()

  # 숫자 포맷 정리
  for col in ["total_score", "valuation_score", "momentum_score", "tech_score"]:
    if col in disp_df.columns:
      disp_df[col] = disp_df[col].round(2)

  if "PER" in disp_df.columns:
    disp_df["PER"] = pd.to_numeric(disp_df["PER"], errors="coerce").round(2)
  if "PBR" in disp_df.columns:
    disp_df["PBR"] = pd.to_numeric(disp_df["PBR"], errors="coerce").round(2)
  if "시가총액" in disp_df.columns:
    disp_df["시가총액"] = disp_df["시가총액"].apply(
      lambda x: f"{x/1e8:,.0f}억" if pd.notna(x) and isinstance(x, (int, float)) and x > 0 else "-"
    )

  # 표시 컬럼 목록 (존재하는 것만)
  show_cols = ["순위", "종목코드", "종목명", "Market",
               "total_score", "valuation_score", "momentum_score", "tech_score",
               "PER", "PBR", "시가총액"]
  show_cols = [c for c in show_cols if c in disp_df.columns]
  disp_df = disp_df[show_cols].copy()

  # 컬럼명 한글화
  disp_df.rename(columns={
    "Market":           "시장",
    "total_score":      "총점(100)",
    "valuation_score":  "저평가(40)",
    "momentum_score":   "수급(40)",
    "tech_score":       "기술(20)",
  }, inplace=True)

  # ── 테이블 출력 ─────────────────────────────────────────────────────
  table = tabulate(
    disp_df,
    headers="keys",
    tablefmt="fancy_grid",
    showindex=False,
    numalign="right",
    stralign="left",
    floatfmt=".2f",
  )
  print(Fore.WHITE + table)

  # ── 점수별 세부 설명 출력 ────────────────────────────────────────────
  print()
  print(Fore.YELLOW + Style.BRIGHT + "  📌 점수 구성 (100점 만점)")
  print(Fore.YELLOW + "  ┌─ 저평가 (40점): PER·PBR 전체 종목 하위 백분위 → 높을수록 저평가")
  print(Fore.YELLOW + "  ├─ 수급   (40점): 최근 5거래일 기관·외국인 순매수 강도 (상위 백분위)")
  print(Fore.YELLOW + "  └─ 기술   (20점): 거래량 급증(1.5배↑) + 이동평균 정배열(5>20>60MA)")
  print()
  print(Fore.RED + "  ⚠️  본 정보는 투자 참고용입니다. 투자 손실의 책임은 투자자 본인에게 있습니다.")
  print(Fore.CYAN + "═" * 76)
  print()


def save_results(top_df: pd.DataFrame, trading_date: str) -> dict:
  """
  결과를 CSV, JSON, TXT 파일로 저장하고 경로 딕셔너리를 반환한다.

  Parameters
  ----------
  top_df       : 상위 종목 DataFrame
  trading_date : 기준 거래일 (YYYYMMDD)

  Returns
  -------
  dict  {"csv": 경로, "json": 경로, "txt": 경로}
  """
  paths = {}

  # ── CSV 저장 ─────────────────────────────────────────────────────────
  csv_path = OUTPUT_DIR / f"top10_{trading_date}.csv"
  top_df.to_csv(csv_path, index=False, encoding="utf-8-sig")
  paths["csv"] = str(csv_path)
  logger.info(f"💾 CSV 저장: {csv_path}")

  # ── JSON 저장 ─────────────────────────────────────────────────────────
  json_path = OUTPUT_DIR / f"top10_{trading_date}.json"
  safe_df   = top_df.where(top_df.notna(), other=None)
  data = {
    "trading_date": trading_date,
    "generated_at": datetime.now().isoformat(),
    "top10":        safe_df.to_dict(orient="records"),
  }
  with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2, default=str)
  paths["json"] = str(json_path)
  logger.info(f"💾 JSON 저장: {json_path}")

  # ── TXT 리포트 저장 ───────────────────────────────────────────────────
  txt_path = OUTPUT_DIR / f"report_{trading_date}.txt"
  fmt_date = f"{trading_date[:4]}-{trading_date[4:6]}-{trading_date[6:]}"
  lines = [
    "=" * 60,
    "  KRX 퀀트 투자 유망 종목 분석 리포트",
    f"  기준일   : {fmt_date}",
    f"  생성일시 : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    "=" * 60,
    "",
    "[ 상위 종목 요약 ]",
    "",
  ]

  for _, row in top_df.iterrows():
    rank     = int(row.get("순위",  "-"))
    code     = row.get("종목코드", "-")
    name     = str(row.get("종목명",  "-"))[:15]
    score    = float(row.get("total_score", 0))
    market   = row.get("Market", "-")
    per_val  = row.get("PER", None)
    pbr_val  = row.get("PBR", None)

    per_str = f"PER={float(per_val):.1f}" if pd.notna(per_val) else ""
    pbr_str = f"PBR={float(pbr_val):.2f}" if pd.notna(pbr_val) else ""
    detail  = " | ".join(filter(None, [per_str, pbr_str]))

    lines.append(f"  {rank:2d}위  {code}  {name:<15s}  총점: {score:.2f}  [{market}]")
    if detail:
      lines.append(f"        └─ {detail}")

  lines += [
    "",
    "[ 점수 기준 ]",
    "  저평가(40점): PER·PBR 전체 종목 대비 하위 백분위일수록 고점수",
    "  수급  (40점): 최근 5거래일 기관·외국인 순매수 강도",
    "  기술  (20점): 거래량 급증(1.5배↑) + 이동평균 정배열(5>20>60MA)",
    "",
    "  ※ 투자 결정의 책임은 투자자 본인에게 있습니다.",
    "=" * 60,
  ]
  with open(txt_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
  paths["txt"] = str(txt_path)
  logger.info(f"💾 TXT 리포트 저장: {txt_path}")

  return paths


# ──────────────────────────────────────────────────────────────────────────────
#  예외 처리 모듈
# ──────────────────────────────────────────────────────────────────────────────

def handle_error(error: Exception, context: str = ""):
  """
  사용자 친화적 오류 메시지를 출력하는 공통 예외 처리 함수.

  공휴일·비거래일·네트워크 오류 등 상황별 안내 메시지를 출력한다.

  Parameters
  ----------
  error   : 발생한 예외 객체
  context : 오류 발생 단계 설명 (예: "거래일 확인", "PER 수집")
  """
  print()
  print(Fore.RED + Style.BRIGHT + "─" * 62)
  print(Fore.RED + f"  ❌ 오류 발생 단계: {context}")
  print(Fore.RED + f"  └─ {type(error).__name__}: {error}")
  print()

  err_str = str(error).lower()

  # ── 공휴일·비거래일 안내 ─────────────────────────────────────────────
  if any(kw in err_str for kw in ["비어", "empty", "none type", "비거래", "holiday", "장"]):
    prev_fri = (datetime.today() - timedelta(days=(datetime.today().weekday() + 3) % 7)).strftime("%Y%m%d")
    print(Fore.YELLOW + "  📅 오늘은 장이 열리지 않는 날이거나")
    print(Fore.YELLOW + "     아직 당일 데이터가 확정되지 않았을 수 있습니다.")
    print(Fore.YELLOW + "")
    print(Fore.YELLOW + "  ✅ 해결 방법: 직전 거래일을 직접 지정해 보세요.")
    print(Fore.YELLOW + f"     python krx_quant_all_in_one.py --date {prev_fri}")

  # ── 네트워크 오류 안내 ────────────────────────────────────────────────
  elif any(kw in err_str for kw in ["connection", "timeout", "network", "http", "ssl", "reset"]):
    print(Fore.YELLOW + "  🌐 인터넷 연결 오류 또는 KRX 서버 일시 불응")
    print(Fore.YELLOW + "     잠시 후 다시 실행해 주세요.")
    print(Fore.YELLOW + "     서버 점검 중일 경우 수십 분 후 재시도를 권장합니다.")

  # ── 라이브러리 미설치 안내 ────────────────────────────────────────────
  elif "importerror" in type(error).__name__.lower() or "no module" in err_str:
    print(Fore.YELLOW + "  📦 필수 라이브러리가 설치되지 않았습니다.")
    print(Fore.YELLOW + "  ✅ 설치 명령어:")
    print(Fore.YELLOW + "     pip install finance-datareader pykrx pandas numpy tabulate colorama requests")

  # ── 일반 오류 ─────────────────────────────────────────────────────────
  else:
    print(Fore.YELLOW + "  🔍 상세 오류 정보를 로그 파일에서 확인하세요: krx_quant_run.log")

  print(Fore.RED + "─" * 62)
  print()
  logger.debug(traceback.format_exc())


# ──────────────────────────────────────────────────────────────────────────────
#  메인 파이프라인
# ──────────────────────────────────────────────────────────────────────────────

def run_pipeline(
  target_date: str = None,
  market: str = "ALL",
  top_n: int = 10,
  max_stocks: int = 300,
) -> pd.DataFrame:
  """
  전체 분석 파이프라인을 단계별로 실행한다.

  ■ 실행 순서
    [1/7] 최근 거래일 확인
    [2/7] 전체 종목 리스트 수집
    [3/7] 기본지표(PER/PBR) 수집
    [4/7] 기관·외국인 수급 데이터 수집
    [5/7] OHLCV(거래량·이동평균) 수집
    [6/7] 3가지 지표 스코어링
    [7/7] 결과 출력 및 저장

  Parameters
  ----------
  target_date : 분석 기준일 (YYYYMMDD). None 이면 자동 탐지
  market      : "KOSPI", "KOSDAQ", "ALL"
  top_n       : 선정할 상위 종목 수
  max_stocks  : OHLCV 수집 최대 종목 수

  Returns
  -------
  pd.DataFrame  상위 top_n 종목 DataFrame (오류 시 빈 DataFrame)
  """
  print()
  print(Fore.CYAN + Style.BRIGHT + "╔" + "═" * 58 + "╗")
  print(Fore.CYAN + Style.BRIGHT + "║    🚀 KRX 퀀트 투자 스코어링 시스템 시작         ║")
  print(Fore.CYAN + Style.BRIGHT + f"║    ⏱  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}                       ║")
  print(Fore.CYAN + Style.BRIGHT + "╚" + "═" * 58 + "╝")
  print()

  # ─────────────────────────────────────────────────────────────────
  # [1/7] 거래일 확인
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + Style.BRIGHT + "  [1/7] 📅 최근 거래일 확인 중...")
  try:
    trading_date = target_date if target_date else get_last_trading_date()
  except Exception as e:
    handle_error(e, "거래일 확인")
    return pd.DataFrame()

  # 기간 범위 계산
  start_5d  = n_trading_days_before(trading_date, 5)    # 수급 5일
  start_70d = n_trading_days_before(trading_date, 70)   # MA60 + 여유분

  print(Fore.GREEN + f"     ✅ 기준일: {trading_date}  |  수급기간: {start_5d}~{trading_date}")

  # ─────────────────────────────────────────────────────────────────
  # [2/7] 종목 리스트 수집
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + Style.BRIGHT + "\n  [2/7] 📋 전체 종목 리스트 수집 중...")
  try:
    stock_list = fetch_stock_list(market=market)
    code_list  = stock_list["Code"].tolist()
  except Exception as e:
    handle_error(e, "종목 리스트 수집")
    return pd.DataFrame()
  print(Fore.GREEN + f"     ✅ {len(stock_list):,}개 종목 ({market} 시장)")

  # ─────────────────────────────────────────────────────────────────
  # [3/7] 기본지표 (PER / PBR) 수집
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + Style.BRIGHT + "\n  [3/7] 📊 PER·PBR 기본지표 수집 중...")
  try:
    fund_df = fetch_fundamental_data(trading_date)
    print(Fore.GREEN + f"     ✅ 기본지표 {len(fund_df):,}개 종목 수집 완료")
  except Exception as e:
    handle_error(e, "기본지표(PER/PBR) 수집")
    print(Fore.YELLOW + "     ⚠️ 기본지표 없이 계속 진행합니다 → 저평가 점수 = 0")
    fund_df = pd.DataFrame()

  # ─────────────────────────────────────────────────────────────────
  # [4/7] 기관·외국인 수급 수집
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + Style.BRIGHT + "\n  [4/7] 🏦 기관·외국인 수급 데이터 수집 중...")
  try:
    investor_data = fetch_investor_trading(start_5d, trading_date)
    total_inv = sum(len(df) for df in investor_data.values() if not df.empty)
    print(Fore.GREEN + f"     ✅ 수급 데이터 {total_inv:,}개 종목 수집 완료")
  except Exception as e:
    handle_error(e, "기관·외국인 수급 수집")
    print(Fore.YELLOW + "     ⚠️ 수급 데이터 없이 계속 진행합니다 → 수급 점수 = 0")
    investor_data = {}

  # ─────────────────────────────────────────────────────────────────
  # [5/7] OHLCV 수집
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + Style.BRIGHT + f"\n  [5/7] 📈 OHLCV 수집 중 (최대 {max_stocks}개)...")
  print(Fore.CYAN + "     (이 단계는 종목 수에 따라 수분이 소요될 수 있습니다)")
  try:
    ohlcv_dict = fetch_ohlcv_bulk(
      code_list, start_70d, trading_date, max_codes=max_stocks
    )
    print(Fore.GREEN + f"     ✅ OHLCV {len(ohlcv_dict):,}개 종목 수집 완료")
  except Exception as e:
    handle_error(e, "OHLCV 수집")
    print(Fore.YELLOW + "     ⚠️ OHLCV 없이 계속 진행합니다 → 기술적 점수 = 0")
    ohlcv_dict = {}

  # ─────────────────────────────────────────────────────────────────
  # 시가총액 수집 (보조 데이터)
  # ─────────────────────────────────────────────────────────────────
  try:
    market_cap_df = fetch_market_cap(trading_date)
  except Exception:
    market_cap_df = pd.DataFrame()

  # ─────────────────────────────────────────────────────────────────
  # [6/7] 스코어링
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + Style.BRIGHT + "\n  [6/7] 🧮 스코어링 알고리즘 실행 중...")

  val_score  = (
    calc_valuation_score(fund_df)
    if not fund_df.empty
    else pd.Series(dtype=float).rename("valuation_score")
  )

  mom_score  = (
    calc_momentum_score(investor_data)
    if investor_data
    else pd.Series(dtype=float).rename("momentum_score")
  )

  tech_score = (
    calc_technical_score(ohlcv_dict)
    if ohlcv_dict
    else pd.Series(dtype=float).rename("tech_score")
  )

  try:
    top_df = combine_scores(
      stock_list_df=stock_list,
      val_score=val_score,
      mom_score=mom_score,
      tech_score=tech_score,
      fund_df=fund_df,
      market_cap_df=market_cap_df,
      top_n=top_n,
    )
  except Exception as e:
    handle_error(e, "종합 점수 계산")
    return pd.DataFrame()

  if top_df.empty:
    print(Fore.YELLOW + "\n  ⚠️ 조건에 맞는 종목이 없습니다. 기준일 또는 시장을 변경해 보세요.")
    return top_df

  # ─────────────────────────────────────────────────────────────────
  # [7/7] 출력 및 저장
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + Style.BRIGHT + "\n  [7/7] 📤 결과 출력 및 저장 중...\n")

  # 콘솔 컬러 테이블 출력
  print_console_report(top_df, trading_date)

  # 파일 저장
  saved_paths = save_results(top_df, trading_date)

  print(Fore.GREEN + Style.BRIGHT + "  🎉 전체 분석 완료!")
  print(Fore.GREEN + f"  📁 저장 위치: {OUTPUT_DIR.resolve()}")
  for fmt, path in saved_paths.items():
    print(Fore.GREEN + f"     └─ {fmt.upper()}: {path}")
  print()

  return top_df


# ──────────────────────────────────────────────────────────────────────────────
#  CLI 인자 파싱
# ──────────────────────────────────────────────────────────────────────────────

def parse_args():
  """커맨드라인 옵션을 파싱한다."""
  parser = argparse.ArgumentParser(
    description="KRX 퀀트 투자 스코어링 시스템 — KOSPI·KOSDAQ 투자 유망 상위 종목 선정",
    formatter_class=argparse.RawDescriptionHelpFormatter,
    epilog="""
사용 예시:
  python krx_quant_all_in_one.py                          기본 실행
  python krx_quant_all_in_one.py --date 20240315          특정 날짜 지정
  python krx_quant_all_in_one.py --market KOSPI           KOSPI만 분석
  python krx_quant_all_in_one.py --top 20                 상위 20개
  python krx_quant_all_in_one.py --max-stocks 500         최대 500종목 OHLCV
  python krx_quant_all_in_one.py --market KOSDAQ --top 5  KOSDAQ 상위 5개
    """,
  )
  parser.add_argument(
    "--date", type=str, default=None,
    help="분석 기준일 (YYYYMMDD). 미입력 시 최근 거래일 자동 탐지",
  )
  parser.add_argument(
    "--market", type=str, default="ALL",
    choices=["KOSPI", "KOSDAQ", "ALL"],
    help="분석 시장 (기본: ALL)",
  )
  parser.add_argument(
    "--top", type=int, default=10,
    help="선정 상위 종목 수 (기본: 10)",
  )
  parser.add_argument(
    "--max-stocks", type=int, default=300,
    help="OHLCV 수집 최대 종목 수 (기본: 300, 클수록 시간 ↑)",
  )
  return parser.parse_args()


# ──────────────────────────────────────────────────────────────────────────────
#  엔트리 포인트
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
  args = parse_args()
  run_pipeline(
    target_date=args.date,
    market=args.market,
    top_n=args.top,
    max_stocks=args.max_stocks,
  )
