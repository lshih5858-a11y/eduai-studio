"""
==============================================================================
[1단계] 데이터 수집 및 전처리 모듈 (data/collector.py)
==============================================================================

■ CoT 1단계: 데이터 수집 및 전처리 로직
  1) pykrx 를 이용해 KRX 전체 종목 리스트를 가져온다.
  2) FinanceDataReader 를 이용해 최근 N거래일의 OHLCV(시가·고가·저가·종가·거래량)를 수집한다.
  3) pykrx 의 get_market_fundamental 로 PER, PBR, EPS, BPS 등 기본지표를 가져온다.
  4) pykrx 의 get_market_trading_value_by_investor 로
     기관·외국인 순매수 데이터를 수집한다.
  5) 수집 실패·공휴일·비거래일 등 예외 상황을 모두 처리한다.

==============================================================================
"""

import time
import logging
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
import FinanceDataReader as fdr
from pykrx import stock as krx_stock

# ── 로거 설정 ──────────────────────────────────────────────────────────────
logging.basicConfig(
  level=logging.INFO,
  format="%(asctime)s [%(levelname)s] %(message)s",
  datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# 거래일 유틸리티
# ─────────────────────────────────────────────────────────────────────────────

def get_recent_trading_days(n_days: int = 30) -> list[str]:
  """
  오늘부터 역산하여 최근 n_days 개의 날짜 문자열(YYYYMMDD)을 반환한다.
  공휴일·주말은 KRX 에서 데이터가 없으므로 여유분을 포함해 수집 후
  실제 거래일을 필터링한다.
  """
  today = datetime.today()
  days = []
  # 주말 제외 달력 날짜를 n_days * 2 배 수집 (공휴일 여유분 확보)
  for i in range(n_days * 3):
    day = today - timedelta(days=i)
    if day.weekday() < 5:          # 월(0)~금(4)만 포함
      days.append(day.strftime("%Y%m%d"))
    if len(days) >= n_days * 2:
      break
  return days


def get_last_trading_date() -> str:
  """
  KRX 데이터에서 실제로 존재하는 가장 최근 거래일을 반환한다.
  """
  # 삼성전자(005930)를 기준으로 최근 거래일을 탐지
  today = datetime.today().strftime("%Y%m%d")
  one_month_ago = (datetime.today() - timedelta(days=30)).strftime("%Y%m%d")
  try:
    df = krx_stock.get_market_ohlcv(one_month_ago, today, "005930")
    if df is None or df.empty:
      raise ValueError("기준 종목 데이터를 가져올 수 없습니다.")
    last_date = df.index[-1].strftime("%Y%m%d")
    logger.info(f"✅ 최근 거래일 확인: {last_date}")
    return last_date
  except Exception as e:
    logger.error(f"❌ 최근 거래일 탐지 실패: {e}")
    raise RuntimeError(f"최근 거래일을 확인할 수 없습니다. 오류: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# 종목 리스트 수집
# ─────────────────────────────────────────────────────────────────────────────

def fetch_stock_list(market: str = "ALL") -> pd.DataFrame:
  """
  KRX 전체(또는 특정 시장) 종목 리스트를 가져온다.

  Parameters
  ----------
  market : str
    "KOSPI", "KOSDAQ", "ALL" 중 하나

  Returns
  -------
  pd.DataFrame
    columns = ["Code", "Name", "Market"]
  """
  logger.info(f"📋 종목 리스트 수집 시작 (시장: {market})")
  try:
    if market == "ALL":
      df_kospi  = fdr.StockListing("KOSPI")[["Code", "Name"]].copy()
      df_kosdaq = fdr.StockListing("KOSDAQ")[["Code", "Name"]].copy()
      df_kospi["Market"]  = "KOSPI"
      df_kosdaq["Market"] = "KOSDAQ"
      df = pd.concat([df_kospi, df_kosdaq], ignore_index=True)
    else:
      df = fdr.StockListing(market)[["Code", "Name"]].copy()
      df["Market"] = market

    # 코드 6자리 zero-padding
    df["Code"] = df["Code"].astype(str).str.zfill(6)

    # 관리종목·ETF·ETN·우선주 등 필터링 (코드 끝자리 0 아닌 것 제외)
    df = df[df["Code"].str[-1] == "0"].reset_index(drop=True)

    logger.info(f"✅ 종목 리스트 수집 완료: {len(df)}개")
    return df

  except Exception as e:
    logger.error(f"❌ 종목 리스트 수집 실패: {e}")
    raise RuntimeError(f"종목 리스트를 가져올 수 없습니다. 오류: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# 기본 지표 (PER / PBR) 수집
# ─────────────────────────────────────────────────────────────────────────────

def fetch_fundamental_data(trading_date: str) -> pd.DataFrame:
  """
  KRX 전체 종목의 PER, PBR, EPS, BPS, 배당수익률을 가져온다.

  Parameters
  ----------
  trading_date : str
    조회 기준일 (YYYYMMDD)

  Returns
  -------
  pd.DataFrame
    index = 종목코드(6자리), columns = [PER, PBR, EPS, BPS, DIV, DPS]
  """
  logger.info(f"📊 기본지표(PER/PBR) 수집 중... (기준일: {trading_date})")
  try:
    df = krx_stock.get_market_fundamental(trading_date, market="ALL")
    if df is None or df.empty:
      raise ValueError("기본지표 데이터가 비어 있습니다. 비거래일일 수 있습니다.")

    # 인덱스(종목코드) 6자리 정규화
    df.index = df.index.astype(str).str.zfill(6)
    logger.info(f"✅ 기본지표 수집 완료: {len(df)}개 종목")
    return df

  except Exception as e:
    logger.error(f"❌ 기본지표 수집 실패: {e}")
    raise RuntimeError(f"기본지표 데이터를 가져올 수 없습니다. 오류: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# 기관/외국인 순매수 데이터 수집
# ─────────────────────────────────────────────────────────────────────────────

def fetch_investor_trading(start_date: str, end_date: str) -> dict[str, pd.DataFrame]:
  """
  KOSPI·KOSDAQ 시장 전체 기관/외국인 순매수 데이터를 수집한다.

  Parameters
  ----------
  start_date : str  → YYYYMMDD
  end_date   : str  → YYYYMMDD

  Returns
  -------
  dict
    {
      "KOSPI" : DataFrame (index=종목코드, columns=[기관합계, 외국인합계]),
      "KOSDAQ": DataFrame (index=종목코드, columns=[기관합계, 외국인합계])
    }
  """
  logger.info(f"🏦 기관/외국인 순매수 데이터 수집 중... ({start_date} ~ {end_date})")
  result = {}

  for market in ["KOSPI", "KOSDAQ"]:
    try:
      # 시장별 전 종목 투자자별 순매수 금액 합산
      df = krx_stock.get_market_trading_value_by_ticker(
        start_date, end_date, market
      )
      if df is None or df.empty:
        logger.warning(f"⚠️ {market} 순매수 데이터 없음")
        result[market] = pd.DataFrame()
        continue

      df.index = df.index.astype(str).str.zfill(6)

      # 필요 컬럼만 추출 (기관합계, 외국인합계)
      keep_cols = []
      for col in df.columns:
        if "기관" in col and "합계" in col:
          keep_cols.append(col)
        elif "외국인" in col and ("합계" in col or col == "외국인"):
          keep_cols.append(col)

      if not keep_cols:
        # 컬럼명이 다를 경우 상위 열 출력 후 자동 선택
        logger.warning(f"⚠️ {market} 컬럼 자동 탐지 사용: {df.columns.tolist()[:6]}")
        numeric_cols = df.select_dtypes(include="number").columns.tolist()
        keep_cols = numeric_cols[:2] if len(numeric_cols) >= 2 else numeric_cols

      df_sub = df[keep_cols].copy()
      df_sub.columns = ["기관합계", "외국인합계"] if len(keep_cols) == 2 else keep_cols
      result[market] = df_sub
      logger.info(f"✅ {market} 순매수 데이터: {len(df_sub)}개 종목")

    except Exception as e:
      logger.warning(f"⚠️ {market} 순매수 데이터 수집 실패: {e}")
      result[market] = pd.DataFrame()

  return result


# ─────────────────────────────────────────────────────────────────────────────
# OHLCV (가격·거래량) 다건 수집
# ─────────────────────────────────────────────────────────────────────────────

def fetch_ohlcv_bulk(
  codes: list[str],
  start_date: str,
  end_date: str,
  max_codes: int = 200,
  sleep_sec: float = 0.05,
) -> dict[str, pd.DataFrame]:
  """
  여러 종목의 OHLCV 데이터를 한꺼번에 수집하여 딕셔너리로 반환한다.

  Parameters
  ----------
  codes     : 종목코드 리스트
  start_date: YYYYMMDD
  end_date  : YYYYMMDD
  max_codes : 최대 수집 종목 수 (과부하 방지)
  sleep_sec : API 호출 간 딜레이(초)

  Returns
  -------
  dict  {종목코드: OHLCV DataFrame}
  """
  logger.info(f"📈 OHLCV 데이터 수집 시작 (총 {len(codes[:max_codes])}개 종목)")
  ohlcv_dict = {}
  target_codes = codes[:max_codes]

  for i, code in enumerate(target_codes):
    try:
      df = krx_stock.get_market_ohlcv(start_date, end_date, code)
      if df is not None and not df.empty:
        ohlcv_dict[code] = df
    except Exception as e:
      logger.debug(f"종목 {code} OHLCV 수집 실패: {e}")

    # 진행상황 10개마다 출력
    if (i + 1) % 50 == 0:
      logger.info(f"  └─ 진행: {i+1}/{len(target_codes)} 종목 완료")

    time.sleep(sleep_sec)  # API 부하 방지

  logger.info(f"✅ OHLCV 수집 완료: {len(ohlcv_dict)}개 종목")
  return ohlcv_dict


# ─────────────────────────────────────────────────────────────────────────────
# 시가총액 데이터 수집
# ─────────────────────────────────────────────────────────────────────────────

def fetch_market_cap(trading_date: str) -> pd.DataFrame:
  """
  전 종목 시가총액 데이터를 수집한다.

  Returns
  -------
  pd.DataFrame
    index = 종목코드, columns = [시가총액, 상장주식수, ...]
  """
  logger.info(f"💰 시가총액 데이터 수집 중... (기준일: {trading_date})")
  try:
    df = krx_stock.get_market_cap(trading_date, market="ALL")
    if df is None or df.empty:
      raise ValueError("시가총액 데이터가 비어 있습니다.")
    df.index = df.index.astype(str).str.zfill(6)
    logger.info(f"✅ 시가총액 수집 완료: {len(df)}개 종목")
    return df
  except Exception as e:
    logger.warning(f"⚠️ 시가총액 수집 실패: {e}")
    return pd.DataFrame()
