"""
==============================================================================
[1단계] 데이터 수집 및 전처리 모듈 (data/collector.py) — v3 완전 재설계
==============================================================================

■ 확인된 문제 (v2까지)
  - pykrx get_market_fundamental, get_market_cap, get_market_trading_*
    → 이 실행 환경에서 KRX data.krx.co.kr 가 LOGOUT(400) 반환
    → 모든 기본지표·수급 점수 = 0

■ v3 데이터 소스 전략 (실제 접속 확인 완료)
  ┌────────────────┬──────────────────────────────────────────────────────┐
  │ 지표           │ 데이터 소스                                            │
  ├────────────────┼──────────────────────────────────────────────────────┤
  │ PER            │ 네이버 금융 sise_market_sum (HTML 스크래핑) ✅         │
  │ PBR            │ 네이버 금융 개별 종목 페이지 em#_pbr ✅               │
  │ ROE, 외국인비율 │ sise_market_sum 페이지 ✅                              │
  ├────────────────┼──────────────────────────────────────────────────────┤
  │ 기관 순매수    │ 네이버 frgn.naver 개별 종목 (Table 3, '기관' 열) ✅   │
  │ 외국인 순매수  │ 네이버 frgn.naver 개별 종목 (Table 3, '외국인' 열) ✅ │
  ├────────────────┼──────────────────────────────────────────────────────┤
  │ OHLCV (60일)   │ pykrx get_market_ohlcv ✅ 정상 작동                   │
  │ 종목 리스트    │ FinanceDataReader StockListing ✅ 정상 작동             │
  └────────────────┴──────────────────────────────────────────────────────┘

■ 수급 점수 설계 (40점)
  - 기관 5일 누적 순매수 : 20점 (백분위 기반)
  - 외국인 5일 누적 순매수: 20점 (백분위 기반)
  ※ 개별 종목 페이지 수집은 시간이 많이 걸리므로, 시총 상위 종목에만 적용

==============================================================================
"""

import re
import time
import logging
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
import numpy as np
import requests
from bs4 import BeautifulSoup
import FinanceDataReader as fdr
from pykrx import stock as krx_stock

# ── 로거 설정 ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── 네이버 금융 공통 HTTP 세션 (싱글톤) ────────────────────────────────────
_NAVER_SESSION: Optional[requests.Session] = None
_NAVER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
    "Referer": "https://finance.naver.com/",
}


def _get_naver_session() -> requests.Session:
    """네이버 금융 세션 싱글톤 반환 — 쿠키를 재사용하여 로그인 상태 유지."""
    global _NAVER_SESSION
    if _NAVER_SESSION is None:
        _NAVER_SESSION = requests.Session()
        _NAVER_SESSION.headers.update(_NAVER_HEADERS)
        try:
            # 쿠키 초기화: 시가총액 정렬 페이지 접속
            _NAVER_SESSION.get(
                "https://finance.naver.com/sise/sise_market_sum.naver?sosok=0",
                timeout=10,
            )
        except Exception:
            pass
    return _NAVER_SESSION


# =============================================================================
# 거래일 유틸리티
# =============================================================================

def get_last_trading_date() -> str:
    """
    pykrx OHLCV(삼성전자 기준)로 최근 실제 거래일을 탐지한다.
    pykrx OHLCV API는 이 환경에서 정상 동작이 확인되어 있다.

    Returns
    -------
    str : 최근 거래일 (YYYYMMDD 형식)

    Raises
    ------
    RuntimeError : OHLCV 데이터를 가져오지 못한 경우 (공휴일, 장 개시 전 등)
    """
    today = datetime.today().strftime("%Y%m%d")
    one_month_ago = (datetime.today() - timedelta(days=30)).strftime("%Y%m%d")
    try:
        df = krx_stock.get_market_ohlcv(one_month_ago, today, "005930")
        if df is None or df.empty:
            raise ValueError("삼성전자 OHLCV 비어 있음 — 비거래일 또는 장 개시 전")
        last_date = df.index[-1].strftime("%Y%m%d")
        logger.info(f"✅ 최근 거래일: {last_date}")
        return last_date
    except Exception as e:
        raise RuntimeError(f"거래일 탐지 실패: {e}")


def n_trading_days_before(base_date: str, n: int) -> str:
    """
    base_date 로부터 n 거래일(주말 제외) 이전 날짜를 반환한다.
    공휴일은 정확히 제외하지 못하지만, 국내 주요 공휴일은 월~금이 아닌
    날이 많아 주말 제외만으로도 충분히 근사치를 얻을 수 있다.

    Parameters
    ----------
    base_date : 기준일 (YYYYMMDD)
    n         : 이전 거래일 수

    Returns
    -------
    str : n 거래일 이전 날짜 (YYYYMMDD)
    """
    dt = datetime.strptime(base_date, "%Y%m%d")
    count = 0
    while count < n:
        dt -= timedelta(days=1)
        if dt.weekday() < 5:   # 월~금(0~4)
            count += 1
    return dt.strftime("%Y%m%d")


# =============================================================================
# 종목 리스트 수집 (FinanceDataReader)
# =============================================================================

def fetch_stock_list(market: str = "ALL") -> pd.DataFrame:
    """
    FinanceDataReader StockListing으로 KOSPI·KOSDAQ 전체 종목 리스트를 가져온다.
    보통주만 필터링 (종목코드 끝자리 = '0').

    Parameters
    ----------
    market : 'KOSPI' | 'KOSDAQ' | 'ALL'

    Returns
    -------
    pd.DataFrame : columns=[Code, Name, Market, 시가총액]
    """
    logger.info(f"📋 종목 리스트 수집 (FDR, 시장: {market})")
    try:
        if market == "ALL":
            df_k = fdr.StockListing("KOSPI")
            df_d = fdr.StockListing("KOSDAQ")
            df_k["Market"] = "KOSPI"
            df_d["Market"] = "KOSDAQ"
            df = pd.concat([df_k, df_d], ignore_index=True)
        else:
            df = fdr.StockListing(market)
            df["Market"] = market

        # 종목코드 6자리 문자열로 정규화
        df["Code"] = df["Code"].astype(str).str.zfill(6)

        # 보통주만 유지 (코드 끝자리 = '0')
        df = df[df["Code"].str[-1] == "0"].reset_index(drop=True)

        # 시가총액 컬럼 정규화
        if "Marcap" in df.columns:
            df["시가총액"] = pd.to_numeric(df["Marcap"], errors="coerce")
        elif "MktCap" in df.columns:
            df["시가총액"] = pd.to_numeric(df["MktCap"], errors="coerce")
        else:
            df["시가총액"] = np.nan

        logger.info(f"✅ 종목 리스트 수집 완료: {len(df)}개 종목")
        return df[["Code", "Name", "Market", "시가총액"]].copy()

    except Exception as e:
        logger.error(f"❌ 종목 리스트 수집 실패: {e}")
        raise RuntimeError(f"종목 리스트 수집 오류: {e}")


# =============================================================================
# PER / ROE / 외국인비율 수집 — 네이버 금융 시가총액 정렬 페이지 스크래핑
# =============================================================================

def _parse_naver_market_sum_page(
    session: requests.Session, sosok: int, page: int
) -> list:
    """
    네이버 금융 sise_market_sum 1페이지를 파싱하여 종목별 기본지표를 반환한다.

    Parameters
    ----------
    session : requests.Session
    sosok   : 0=KOSPI, 1=KOSDAQ
    page    : 페이지 번호

    Returns
    -------
    list of dict : [{'Code', 'PER', 'ROE', '외국인비율', '시가총액_억'}, ...]
    """
    url = (
        f"https://finance.naver.com/sise/sise_market_sum.naver"
        f"?sosok={sosok}&page={page}"
    )
    try:
        r = session.get(url, timeout=12)
        r.raise_for_status()
    except Exception as e:
        logger.warning(f"  네이버 시장요약 {page}페이지 오류: {e}")
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    table = soup.find("table", {"class": "type_2"})
    if not table:
        return []

    # 헤더 파악 (컬럼 인덱스 동적 탐지)
    headers = [th.text.strip() for th in table.find_all("th")]

    def _col_idx(name: str, default: int) -> int:
        try:
            return headers.index(name)
        except ValueError:
            return default

    per_idx  = _col_idx("PER",    10)
    roe_idx  = _col_idx("ROE",    11)
    frgn_idx = _col_idx("외국인비율", 8)
    mcap_idx = _col_idx("시가총액",  6)  # 단위: 억원

    rows_out = []
    for row in table.find_all("tr"):
        cells = row.find_all("td")
        link  = row.find("a", href=re.compile(r"code=\d+"))
        if not link or len(cells) < 10:
            continue

        code = link["href"].split("code=")[-1].strip().zfill(6)
        vals = [c.text.strip().replace(",", "").replace("+", "").replace("%", "") for c in cells]

        def _safe(v: str) -> Optional[float]:
            """공백·N/A 등을 None으로, 나머지는 float으로 변환."""
            if not v or v in ("N/A", "-", "—", ""):
                return None
            try:
                f = float(v)
                return None if f == 0 else f
            except (ValueError, TypeError):
                return None

        rows_out.append({
            "Code":      code,
            "PER":       _safe(vals[per_idx])  if per_idx  < len(vals) else None,
            "ROE":       _safe(vals[roe_idx])  if roe_idx  < len(vals) else None,
            "외국인비율": _safe(vals[frgn_idx]) if frgn_idx < len(vals) else None,
            "시가총액_억": _safe(vals[mcap_idx]) if mcap_idx < len(vals) else None,
        })

    return rows_out


def _get_naver_total_pages(session: requests.Session, sosok: int) -> int:
    """네이버 금융 시가총액 페이지의 총 페이지 수를 반환한다."""
    url = (
        f"https://finance.naver.com/sise/sise_market_sum.naver"
        f"?sosok={sosok}&page=1"
    )
    try:
        r = session.get(url, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        pager = soup.find("td", {"class": "pgRR"})
        if pager and pager.find("a"):
            href = pager.find("a")["href"]
            return int(href.split("page=")[-1])
    except Exception:
        pass
    return 50   # 기본값 (KOSPI ~50페이지, KOSDAQ ~60페이지)


def fetch_per_roe_data(max_pages_per_market: int = 60) -> pd.DataFrame:
    """
    네이버 금융 시가총액 정렬 페이지를 순회하여 PER·ROE·외국인비율을 수집한다.

    Parameters
    ----------
    max_pages_per_market : 시장별 최대 수집 페이지 수 (기본 60 → ~3000종목)

    Returns
    -------
    pd.DataFrame : index=종목코드, columns=[PER, ROE, 외국인비율, 시가총액_억]
    """
    logger.info("📊 [PER/ROE] 네이버 금융 시가총액 페이지 수집 시작...")
    session = _get_naver_session()
    all_rows: list = []

    for sosok, market_name in [(0, "KOSPI"), (1, "KOSDAQ")]:
        total_pages  = _get_naver_total_pages(session, sosok)
        pages_to_get = min(total_pages, max_pages_per_market)
        logger.info(f"  [{market_name}] 총 {total_pages}p → {pages_to_get}p 수집")

        for page in range(1, pages_to_get + 1):
            rows = _parse_naver_market_sum_page(session, sosok, page)
            all_rows.extend(rows)
            if page % 10 == 0:
                logger.info(f"    └─ {market_name} {page}/{pages_to_get}p 완료 (누적 {len(all_rows)}종목)")
            time.sleep(0.15)  # 서버 부하 방지 (초당 ~6.7 요청)

        logger.info(f"  ✅ {market_name} 완료: 누적 {len(all_rows)}종목")

    if not all_rows:
        logger.warning("⚠️ PER/ROE 수집 결과 없음 → 빈 DataFrame 반환")
        return pd.DataFrame()

    df = pd.DataFrame(all_rows).set_index("Code")
    # 중복 코드는 첫 번째 유지 (시가총액 순 정렬로 인해 앞쪽이 더 신뢰도 높음)
    df = df[~df.index.duplicated(keep="first")]
    logger.info(f"✅ PER/ROE 수집 완료: {len(df)}개 종목 (PER 유효: {df['PER'].notna().sum()}개)")
    return df


# =============================================================================
# PBR 수집 — 네이버 금융 개별 종목 페이지 (em#_pbr)
# =============================================================================

def fetch_pbr_for_codes(
    codes: list,
    sleep_sec: float = 0.1,
    max_codes: int = 500,
) -> pd.Series:
    """
    네이버 금융 개별 종목 페이지(item/main.naver)에서 PBR을 수집한다.
    PBR은 sise_market_sum 기본 컬럼에 없으므로 개별 종목 페이지에서 따로 가져온다.

    수집 방법:
        https://finance.naver.com/item/main.naver?code=XXXXXX
        페이지 내 <em id="_pbr">3.14</em> 요소에서 PBR 추출

    Parameters
    ----------
    codes    : 종목코드 리스트
    sleep_sec: 요청 간 대기 시간 (초)
    max_codes: 최대 수집 종목 수 (시간 절약)

    Returns
    -------
    pd.Series : index=종목코드, name='PBR', values=float or NaN
    """
    target = codes[:max_codes]
    logger.info(f"📐 [PBR] 개별 종목 페이지에서 PBR 수집 ({len(target)}종목)...")
    session = _get_naver_session()
    pbr_data: dict = {}

    for i, code in enumerate(target):
        url = f"https://finance.naver.com/item/main.naver?code={code}"
        try:
            r = session.get(url, timeout=10)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")
            em = soup.select_one("em#_pbr")
            if em:
                val_str = em.text.strip().replace(",", "")
                try:
                    pbr = float(val_str)
                    pbr_data[code] = pbr if pbr > 0 else np.nan
                except ValueError:
                    pbr_data[code] = np.nan
            else:
                pbr_data[code] = np.nan
        except Exception:
            pbr_data[code] = np.nan

        if (i + 1) % 50 == 0:
            logger.info(f"    └─ PBR {i+1}/{len(target)} 완료 (유효: {sum(1 for v in pbr_data.values() if not np.isnan(v))}개)")
        time.sleep(sleep_sec)

    result = pd.Series(pbr_data, name="PBR")
    logger.info(f"✅ PBR 수집 완료: {result.notna().sum()}/{len(target)}개 유효")
    return result


# =============================================================================
# 기관·외국인 순매수 수집 — 네이버 금융 개별 종목 frgn 페이지
# =============================================================================

def fetch_investor_net_buy(
    codes: list,
    days: int = 5,
    sleep_sec: float = 0.12,
    max_codes: int = 400,
) -> pd.DataFrame:
    """
    네이버 금융 개별 종목 frgn.naver 페이지에서 기관·외국인 순매수를 수집한다.

    수집 방법:
        https://finance.naver.com/item/frgn.naver?code=XXXXXX
        페이지 내 Table 3: 날짜, 종가, 전일비, 등락률, 거래량, 기관, 외국인, ...

    최근 days일의 기관 순매수와 외국인 순매수를 합산한다.

    Parameters
    ----------
    codes    : 종목코드 리스트
    days     : 최근 N일 누적 순매수 집계 기간 (기본 5일)
    sleep_sec: 요청 간 대기 시간 (초)
    max_codes: 최대 수집 종목 수

    Returns
    -------
    pd.DataFrame : index=종목코드, columns=[기관누적, 외국인누적]
    """
    target = codes[:max_codes]
    logger.info(
        f"💹 [기관/외국인 순매수] 네이버 frgn 페이지 수집 "
        f"({len(target)}종목, 최근 {days}일)..."
    )
    session = _get_naver_session()
    investor_data: dict = {}

    for i, code in enumerate(target):
        url = f"https://finance.naver.com/item/frgn.naver?code={code}"
        try:
            r = session.get(url, timeout=10)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")
            tables = soup.find_all("table")

            # Table 3 탐지: '날짜', '종가', '기관', '외국인' 컬럼 포함
            target_table = None
            for t in tables:
                ths = [th.text.strip() for th in t.find_all("th")]
                if "기관" in ths and "외국인" in ths:
                    target_table = t
                    ths_list = ths
                    break

            if target_table is None:
                investor_data[code] = {"기관누적": np.nan, "외국인누적": np.nan}
                continue

            # 기관·외국인 컬럼 인덱스 찾기
            try:
                inst_idx = ths_list.index("기관")
                frgn_idx = ths_list.index("외국인")
            except ValueError:
                investor_data[code] = {"기관누적": np.nan, "외국인누적": np.nan}
                continue

            inst_total = 0.0
            frgn_total = 0.0
            row_count  = 0

            for row in target_table.find_all("tr"):
                cells = row.find_all("td")
                if len(cells) < max(inst_idx, frgn_idx) + 1:
                    continue
                # 날짜 컬럼으로 유효 데이터 행 확인
                date_text = cells[0].text.strip()
                if not re.match(r"\d{4}\.\d{2}\.\d{2}", date_text):
                    continue

                def _parse_num(s: str) -> float:
                    """'+1,234' 또는 '-1,234' → float."""
                    s = s.replace(",", "").strip()
                    if not s or s in ("-", "—"):
                        return 0.0
                    try:
                        return float(s)
                    except ValueError:
                        return 0.0

                inst_val = _parse_num(cells[inst_idx].text)
                frgn_val = _parse_num(cells[frgn_idx].text)
                inst_total += inst_val
                frgn_total += frgn_val
                row_count  += 1

                if row_count >= days:
                    break

            if row_count == 0:
                investor_data[code] = {"기관누적": np.nan, "외국인누적": np.nan}
            else:
                investor_data[code] = {
                    "기관누적":   inst_total,
                    "외국인누적": frgn_total,
                }

        except Exception:
            investor_data[code] = {"기관누적": np.nan, "외국인누적": np.nan}

        if (i + 1) % 50 == 0:
            valid = sum(
                1 for v in investor_data.values()
                if not np.isnan(v.get("기관누적", np.nan))
            )
            logger.info(f"    └─ 수급 {i+1}/{len(target)} 완료 (유효: {valid}개)")
        time.sleep(sleep_sec)

    df = pd.DataFrame.from_dict(investor_data, orient="index")
    logger.info(
        f"✅ 수급 수집 완료: 기관 유효 {df['기관누적'].notna().sum()}개, "
        f"외국인 유효 {df['외국인누적'].notna().sum()}개"
    )
    return df


# =============================================================================
# OHLCV 다건 수집 (pykrx)
# =============================================================================

def fetch_ohlcv_bulk(
    codes: list,
    start_date: str,
    end_date: str,
    max_codes: int = 300,
    sleep_sec: float = 0.05,
) -> dict:
    """
    여러 종목의 OHLCV를 pykrx로 수집한다.
    pykrx get_market_ohlcv는 이 환경에서 정상 작동이 확인되어 있다.

    Parameters
    ----------
    codes      : 종목코드 리스트
    start_date : 시작일 (YYYYMMDD)
    end_date   : 종료일 (YYYYMMDD)
    max_codes  : 최대 수집 종목 수 (서버 부하 방지)
    sleep_sec  : 요청 간 대기 시간 (초)

    Returns
    -------
    dict : {종목코드: OHLCV DataFrame}
    """
    target = codes[:max_codes]
    logger.info(f"📈 OHLCV 수집: {len(target)}개 종목 ({start_date} ~ {end_date})")
    result: dict = {}

    for i, code in enumerate(target):
        try:
            df = krx_stock.get_market_ohlcv(start_date, end_date, code)
            if df is not None and not df.empty and len(df) >= 5:
                result[code] = df
        except Exception:
            pass

        if (i + 1) % 50 == 0:
            logger.info(f"  ↳ OHLCV {i+1}/{len(target)} 완료 (성공: {len(result)}개)")
        time.sleep(sleep_sec)

    logger.info(f"✅ OHLCV 수집 완료: {len(result)}/{len(target)}개 성공")
    return result


# =============================================================================
# 통합 기본지표 수집 파이프라인
# =============================================================================

def fetch_fundamental_data(
    stock_codes: list,
    max_pages: int = 60,
    fetch_pbr: bool = True,
    max_pbr_codes: int = 500,
) -> pd.DataFrame:
    """
    PER, PBR, ROE, 외국인비율을 통합 수집하여 하나의 DataFrame으로 반환한다.

    1) sise_market_sum 페이지에서 PER·ROE·외국인비율 수집
    2) 개별 종목 페이지에서 PBR 수집 (fetch_pbr=True 시)

    Parameters
    ----------
    stock_codes   : 수집 대상 종목코드 리스트
    max_pages     : sise_market_sum 시장별 최대 페이지 수
    fetch_pbr     : 개별 종목 PBR 수집 여부
    max_pbr_codes : PBR 수집 최대 종목 수

    Returns
    -------
    pd.DataFrame : index=종목코드, columns=[PER, PBR, ROE, 외국인비율, 시가총액_억]
    """
    logger.info("🔍 [기본지표] 통합 수집 파이프라인 시작...")

    # Step 1: PER·ROE·외국인비율 수집
    per_roe_df = fetch_per_roe_data(max_pages_per_market=max_pages)

    # Step 2: PBR 수집 (시총 상위 종목 우선)
    if fetch_pbr and stock_codes:
        # stock_codes는 이미 시총 순 정렬된 상태라 가정
        pbr_target = [c for c in stock_codes if c in per_roe_df.index][:max_pbr_codes]
        if pbr_target:
            pbr_series = fetch_pbr_for_codes(pbr_target, max_codes=max_pbr_codes)
            per_roe_df = per_roe_df.join(pbr_series, how="left")
        else:
            per_roe_df["PBR"] = np.nan
    else:
        per_roe_df["PBR"] = np.nan

    logger.info(
        f"✅ [기본지표] 통합 완료: {len(per_roe_df)}개 종목 | "
        f"PER 유효={per_roe_df['PER'].notna().sum()}, "
        f"PBR 유효={per_roe_df['PBR'].notna().sum()}"
    )
    return per_roe_df


# =============================================================================
# 수급 데이터 수집 파이프라인
# =============================================================================

def fetch_investor_trading(
    codes: list,
    days: int = 5,
    max_codes: int = 400,
) -> pd.DataFrame:
    """
    기관·외국인 5일 누적 순매수를 수집하는 통합 함수.

    Parameters
    ----------
    codes    : 종목코드 리스트 (시총 상위 순)
    days     : 최근 N일 집계 기간 (기본 5일)
    max_codes: 최대 수집 종목 수

    Returns
    -------
    pd.DataFrame : index=종목코드, columns=[기관누적, 외국인누적]
    """
    return fetch_investor_net_buy(codes=codes, days=days, max_codes=max_codes)
