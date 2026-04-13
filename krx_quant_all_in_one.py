"""
================================================================================
 KRX 퀀트 투자 스코어링 시스템 v3 — 단일 파일 완전판
================================================================================
 수정일  : 2026-04-13
 버전    : v3 (기관·외국인 실제 수급 데이터 수집 복원)

 ■ v3 핵심 개선사항
   ─────────────────────────────────────────────────────────────────
   문제: pykrx KRX API (data.krx.co.kr) → 이 환경에서 LOGOUT(400) 반환
         → PER/PBR·수급 데이터 0점 처리 → 모든 종목 기술 20점만 부여

   v3 해결: 네이버 금융 HTML 스크래핑으로 완전 대체
   ─────────────────────────────────────────────────────────────────
   데이터          │ v2 (실패)               │ v3 (정상)
   ────────────────┼─────────────────────────┼───────────────────────────
   PER·ROE·외인비율│ pykrx → LOGOUT          │ 네이버 sise_market_sum ✅
   PBR            │ pykrx → LOGOUT          │ 네이버 item/main em#_pbr ✅
   기관 순매수    │ pykrx → LOGOUT          │ 네이버 frgn.naver Table ✅
   외국인 순매수  │ pykrx → LOGOUT          │ 네이버 frgn.naver Table ✅
   OHLCV (60일)  │ pykrx ✅ 정상             │ pykrx ✅ 유지
   종목 리스트   │ FDR ✅ 정상               │ FDR ✅ 유지
   ─────────────────────────────────────────────────────────────────

 ■ 점수 구성 (100점 만점) — v3 원래 설계 복원
   저평가 40점 = PER 20점 + PBR 20점 (PBR 없으면 ROE 대체)
   수급   40점 = 기관 5일 순매수 20점 + 외국인 5일 순매수 20점
   기술   20점 = 거래량 1.5배↑ 급증 10점 + 5MA>20MA>60MA 정배열 10점

 ■ 단계적 사고(CoT) 설계
   1단계: 데이터 수집 및 전처리
     - 종목 리스트 → FDR StockListing
     - PER/ROE    → 네이버 sise_market_sum 스크래핑
     - PBR        → 네이버 개별 종목 em#_pbr
     - 수급       → 네이버 frgn.naver 개별 종목 테이블
     - OHLCV      → pykrx get_market_ohlcv
   2단계: 스코어링
     - 저평가: 백분위 하위 종목에 고점수
     - 수급  : 백분위 상위 순매수 종목에 고점수
     - 기술  : 이진 조건 (충족=10점, 미충족=0점)
   3단계: 상위 N개 출력 및 저장

 ■ 사용 방법
   python krx_quant_all_in_one.py
   python krx_quant_all_in_one.py --date 20260410
   python krx_quant_all_in_one.py --market KOSPI --top 20
   python krx_quant_all_in_one.py --max-stocks 200
   python krx_quant_all_in_one.py --fast    # 빠른 모드(PBR·수급 생략)

 ■ 필수 라이브러리 설치
   pip install finance-datareader pykrx pandas numpy tabulate colorama requests beautifulsoup4

 ■ 면책 조항
   본 프로그램의 결과는 투자 참고용이며,
   투자 결정의 최종 책임은 투자자 본인에게 있습니다.
================================================================================
"""

# ── 표준 라이브러리 ──────────────────────────────────────────────────────────
import os
import re
import sys
import json
import time
import logging
import argparse
import traceback
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

# ── 필수 패키지 설치 확인 ─────────────────────────────────────────────────
def _check_deps():
    """필수 라이브러리가 설치되어 있는지 확인한다."""
    required = {
        "finance-datareader": "FinanceDataReader",
        "pykrx":              "pykrx",
        "pandas":             "pandas",
        "numpy":              "numpy",
        "tabulate":           "tabulate",
        "colorama":           "colorama",
        "requests":           "requests",
        "beautifulsoup4":     "bs4",
    }
    missing = []
    for pkg, module in required.items():
        try:
            __import__(module)
        except ImportError:
            missing.append(pkg)
    if missing:
        print(f"\n❌ 필수 라이브러리 미설치: {', '.join(missing)}")
        print(f"   설치 명령: pip install {' '.join(missing)}\n")
        sys.exit(1)

_check_deps()

# ── 서드파티 패키지 ──────────────────────────────────────────────────────────
import pandas as pd
import numpy as np
import requests
from bs4 import BeautifulSoup
import FinanceDataReader as fdr
from pykrx import stock as krx_stock
from tabulate import tabulate
from colorama import Fore, Style, init as colorama_init

colorama_init(autoreset=True)

# ── 로거 설정 ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("krx_quant_run.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)

# ── 출력 디렉토리 ────────────────────────────────────────────────────────────
OUTPUT_DIR = Path("krx_quant_output")
OUTPUT_DIR.mkdir(exist_ok=True)

# ── 네이버 금융 공통 세션 ─────────────────────────────────────────────────
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
    """네이버 금융 세션 싱글톤 반환."""
    global _NAVER_SESSION
    if _NAVER_SESSION is None:
        _NAVER_SESSION = requests.Session()
        _NAVER_SESSION.headers.update(_NAVER_HEADERS)
        try:
            _NAVER_SESSION.get(
                "https://finance.naver.com/sise/sise_market_sum.naver?sosok=0",
                timeout=10,
            )
        except Exception:
            pass
    return _NAVER_SESSION


# ==============================================================================
# 1단계: 데이터 수집 및 전처리
# ==============================================================================

# ── [1-A] 거래일 탐지 ─────────────────────────────────────────────────────

def get_last_trading_date() -> str:
    """
    pykrx OHLCV(삼성전자)로 최근 실제 거래일을 탐지한다.

    Returns: 최근 거래일 YYYYMMDD 문자열
    Raises: RuntimeError (공휴일·비거래일·장 개시 전 등)
    """
    today         = datetime.today().strftime("%Y%m%d")
    one_month_ago = (datetime.today() - timedelta(days=30)).strftime("%Y%m%d")
    try:
        df = krx_stock.get_market_ohlcv(one_month_ago, today, "005930")
        if df is None or df.empty:
            raise ValueError("삼성전자 OHLCV 비어 있음")
        last_date = df.index[-1].strftime("%Y%m%d")
        logger.info(f"✅ 최근 거래일: {last_date}")
        return last_date
    except Exception as e:
        raise RuntimeError(
            f"거래일 탐지 실패: {e}\n"
            "오늘은 장이 열리지 않는 날(공휴일·주말)이거나 "
            "아직 당일 데이터가 확정되지 않았을 수 있습니다."
        )


def n_trading_days_before(base_date: str, n: int) -> str:
    """base_date로부터 n 거래일(주말 제외) 이전 날짜 반환."""
    dt = datetime.strptime(base_date, "%Y%m%d")
    count = 0
    while count < n:
        dt -= timedelta(days=1)
        if dt.weekday() < 5:
            count += 1
    return dt.strftime("%Y%m%d")


# ── [1-B] 종목 리스트 (FDR) ───────────────────────────────────────────────

def fetch_stock_list(market: str = "ALL") -> pd.DataFrame:
    """
    FinanceDataReader로 KOSPI·KOSDAQ 전체 보통주 리스트 수집.

    Returns: DataFrame(Code, Name, Market, 시가총액)
    """
    logger.info(f"📋 종목 리스트 수집 (FDR, 시장: {market})")
    try:
        if market == "ALL":
            df_k = fdr.StockListing("KOSPI");  df_k["Market"] = "KOSPI"
            df_d = fdr.StockListing("KOSDAQ"); df_d["Market"] = "KOSDAQ"
            df = pd.concat([df_k, df_d], ignore_index=True)
        else:
            df = fdr.StockListing(market)
            df["Market"] = market

        df["Code"] = df["Code"].astype(str).str.zfill(6)
        df = df[df["Code"].str[-1] == "0"].reset_index(drop=True)  # 보통주만

        # 시가총액 정규화
        for col in ["Marcap", "MktCap"]:
            if col in df.columns:
                df["시가총액"] = pd.to_numeric(df[col], errors="coerce")
                break
        else:
            df["시가총액"] = np.nan

        logger.info(f"✅ 종목 리스트: {len(df)}개 종목")
        return df[["Code", "Name", "Market", "시가총액"]].copy()
    except Exception as e:
        raise RuntimeError(f"종목 리스트 수집 오류: {e}")


# ── [1-C] PER · ROE · 외국인비율 (네이버 sise_market_sum) ──────────────────

def _parse_naver_sum_page(session: requests.Session, sosok: int, page: int) -> list:
    """네이버 금융 시가총액 정렬 1페이지 파싱 → 종목별 기본지표 리스트."""
    url = f"https://finance.naver.com/sise/sise_market_sum.naver?sosok={sosok}&page={page}"
    try:
        r = session.get(url, timeout=12)
        r.raise_for_status()
    except Exception as e:
        logger.warning(f"  sise_market_sum {page}p 오류: {e}")
        return []

    soup  = BeautifulSoup(r.text, "html.parser")
    table = soup.find("table", {"class": "type_2"})
    if not table:
        return []

    headers = [th.text.strip() for th in table.find_all("th")]

    def _idx(name, default):
        try:    return headers.index(name)
        except: return default

    per_idx  = _idx("PER",    10)
    roe_idx  = _idx("ROE",    11)
    frgn_idx = _idx("외국인비율", 8)
    mcap_idx = _idx("시가총액", 6)

    out = []
    for row in table.find_all("tr"):
        cells = row.find_all("td")
        link  = row.find("a", href=re.compile(r"code=\d+"))
        if not link or len(cells) < 10:
            continue

        code = link["href"].split("code=")[-1].strip().zfill(6)
        vals = [c.text.strip().replace(",", "").replace("+", "").replace("%", "") for c in cells]

        def _sf(v):
            if not v or v in ("N/A", "-", "—", ""):
                return None
            try:
                f = float(v)
                return None if f == 0 else f
            except:
                return None

        out.append({
            "Code":       code,
            "PER":        _sf(vals[per_idx])  if per_idx  < len(vals) else None,
            "ROE":        _sf(vals[roe_idx])  if roe_idx  < len(vals) else None,
            "외국인비율": _sf(vals[frgn_idx]) if frgn_idx < len(vals) else None,
            "시가총액_억": _sf(vals[mcap_idx]) if mcap_idx < len(vals) else None,
        })
    return out


def _naver_total_pages(session, sosok):
    url = f"https://finance.naver.com/sise/sise_market_sum.naver?sosok={sosok}&page=1"
    try:
        r = session.get(url, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        pager = soup.find("td", {"class": "pgRR"})
        if pager and pager.find("a"):
            return int(pager.find("a")["href"].split("page=")[-1])
    except:
        pass
    return 50


def fetch_per_roe_data(max_pages: int = 60) -> pd.DataFrame:
    """
    네이버 금융 sise_market_sum에서 PER·ROE·외국인비율 전체 수집.

    Parameters: max_pages — 시장별 최대 페이지 수 (기본 60 → ~3000종목)
    Returns: DataFrame(index=종목코드, columns=[PER, ROE, 외국인비율, 시가총액_억])
    """
    logger.info("📊 [PER/ROE] 네이버 금융 수집 시작...")
    session  = _get_naver_session()
    all_rows = []

    for sosok, name in [(0, "KOSPI"), (1, "KOSDAQ")]:
        total  = _naver_total_pages(session, sosok)
        pages  = min(total, max_pages)
        logger.info(f"  [{name}] {total}p → {pages}p 수집")

        for page in range(1, pages + 1):
            all_rows.extend(_parse_naver_sum_page(session, sosok, page))
            if page % 10 == 0:
                logger.info(f"    └─ {name} {page}/{pages}p (누적 {len(all_rows)}종목)")
            time.sleep(0.15)

        logger.info(f"  ✅ {name} 완료: 누적 {len(all_rows)}종목")

    if not all_rows:
        logger.warning("⚠️ PER/ROE 수집 결과 없음")
        return pd.DataFrame()

    df = pd.DataFrame(all_rows).set_index("Code")
    df = df[~df.index.duplicated(keep="first")]
    logger.info(f"✅ PER/ROE 완료: {len(df)}개 | PER유효={df['PER'].notna().sum()}")
    return df


# ── [1-D] PBR (네이버 개별 종목 페이지) ──────────────────────────────────

def fetch_pbr_for_codes(codes: list, sleep_sec: float = 0.1, max_codes: int = 500) -> pd.Series:
    """
    네이버 금융 item/main.naver의 em#_pbr 요소에서 PBR 수집.

    수집 방법:
        https://finance.naver.com/item/main.naver?code=XXXXXX
        <em id="_pbr">3.14</em> → PBR = 3.14

    Returns: Series(index=종목코드, name='PBR')
    """
    target = codes[:max_codes]
    logger.info(f"📐 [PBR] 개별 종목 페이지 PBR 수집 ({len(target)}종목)...")
    session   = _get_naver_session()
    pbr_data  = {}

    for i, code in enumerate(target):
        try:
            r   = session.get(f"https://finance.naver.com/item/main.naver?code={code}", timeout=10)
            r.raise_for_status()
            em  = BeautifulSoup(r.text, "html.parser").select_one("em#_pbr")
            if em:
                val = em.text.strip().replace(",", "")
                try:
                    pbr = float(val)
                    pbr_data[code] = pbr if pbr > 0 else np.nan
                except ValueError:
                    pbr_data[code] = np.nan
            else:
                pbr_data[code] = np.nan
        except Exception:
            pbr_data[code] = np.nan

        if (i + 1) % 50 == 0:
            valid = sum(1 for v in pbr_data.values() if not (isinstance(v, float) and np.isnan(v)))
            logger.info(f"    └─ PBR {i+1}/{len(target)} (유효: {valid}개)")
        time.sleep(sleep_sec)

    result = pd.Series(pbr_data, name="PBR")
    logger.info(f"✅ PBR 수집 완료: {result.notna().sum()}/{len(target)}")
    return result


# ── [1-E] 기관·외국인 순매수 (네이버 frgn.naver) ──────────────────────────

def fetch_investor_net_buy(codes: list, days: int = 5, sleep_sec: float = 0.12, max_codes: int = 400) -> pd.DataFrame:
    """
    네이버 금융 frgn.naver 개별 종목 페이지에서 기관·외국인 순매수 수집.

    수집 방법:
        https://finance.naver.com/item/frgn.naver?code=XXXXXX
        테이블(날짜·종가·기관·외국인)에서 최근 days일 누적 합산

    Returns: DataFrame(index=종목코드, columns=[기관누적, 외국인누적])
    """
    target = codes[:max_codes]
    logger.info(f"💹 [수급] 네이버 frgn 페이지 수집 ({len(target)}종목, {days}일)...")
    session  = _get_naver_session()
    inv_data = {}

    for i, code in enumerate(target):
        try:
            r    = session.get(f"https://finance.naver.com/item/frgn.naver?code={code}", timeout=10)
            r.raise_for_status()
            tables = BeautifulSoup(r.text, "html.parser").find_all("table")

            # '기관'·'외국인' 컬럼이 있는 테이블 탐색
            target_t = None
            ths_list  = []
            for t in tables:
                ths = [th.text.strip() for th in t.find_all("th")]
                if "기관" in ths and "외국인" in ths:
                    target_t  = t
                    ths_list  = ths
                    break

            if target_t is None:
                inv_data[code] = {"기관누적": np.nan, "외국인누적": np.nan}
                continue

            try:
                inst_idx = ths_list.index("기관")
                frgn_idx = ths_list.index("외국인")
            except ValueError:
                inv_data[code] = {"기관누적": np.nan, "외국인누적": np.nan}
                continue

            inst_sum = 0.0
            frgn_sum = 0.0
            row_cnt  = 0

            for row in target_t.find_all("tr"):
                cells = row.find_all("td")
                if len(cells) <= max(inst_idx, frgn_idx):
                    continue
                if not re.match(r"\d{4}\.\d{2}\.\d{2}", cells[0].text.strip()):
                    continue

                def _pn(s):
                    s = s.replace(",", "").strip()
                    try:    return float(s)
                    except: return 0.0

                inst_sum += _pn(cells[inst_idx].text)
                frgn_sum += _pn(cells[frgn_idx].text)
                row_cnt  += 1
                if row_cnt >= days:
                    break

            inv_data[code] = (
                {"기관누적": inst_sum, "외국인누적": frgn_sum}
                if row_cnt > 0
                else {"기관누적": np.nan, "외국인누적": np.nan}
            )

        except Exception:
            inv_data[code] = {"기관누적": np.nan, "외국인누적": np.nan}

        if (i + 1) % 50 == 0:
            valid = sum(1 for v in inv_data.values() if not np.isnan(v.get("기관누적", np.nan)))
            logger.info(f"    └─ 수급 {i+1}/{len(target)} (유효: {valid}개)")
        time.sleep(sleep_sec)

    df = pd.DataFrame.from_dict(inv_data, orient="index")
    logger.info(f"✅ 수급 완료: 기관={df['기관누적'].notna().sum()}, 외국인={df['외국인누적'].notna().sum()}")
    return df


# ── [1-F] OHLCV (pykrx) ───────────────────────────────────────────────────

def fetch_ohlcv_bulk(codes: list, start_date: str, end_date: str, max_codes: int = 300, sleep_sec: float = 0.05) -> dict:
    """
    여러 종목 OHLCV를 pykrx로 수집한다 (이 환경에서 정상 작동 확인됨).

    Returns: {종목코드: OHLCV DataFrame}
    """
    target = codes[:max_codes]
    logger.info(f"📈 OHLCV 수집: {len(target)}개 ({start_date}~{end_date})")
    result = {}

    for i, code in enumerate(target):
        try:
            df = krx_stock.get_market_ohlcv(start_date, end_date, code)
            if df is not None and not df.empty and len(df) >= 5:
                result[code] = df
        except Exception:
            pass
        if (i + 1) % 50 == 0:
            logger.info(f"  ↳ OHLCV {i+1}/{len(target)} (성공: {len(result)}개)")
        time.sleep(sleep_sec)

    logger.info(f"✅ OHLCV 완료: {len(result)}/{len(target)}")
    return result


# ==============================================================================
# 2단계: 스코어링 (점수화)
# ==============================================================================

def _percentile_score(series: pd.Series, higher_is_better: bool = False) -> pd.Series:
    """
    수치 시리즈를 0~100 백분위 점수로 변환한다.

    higher_is_better=False → 낮을수록 고점수 (PER, PBR)
    higher_is_better=True  → 높을수록 고점수 (순매수, 모멘텀)
    """
    rank = series.rank(method="average", na_option="bottom")
    n    = series.notna().sum()
    if n == 0:
        return pd.Series(0.0, index=series.index)
    pct = (rank / n) * 100
    if not higher_is_better:
        pct = 100 - pct
    return pct.clip(0, 100)


def calc_valuation_score(fund_df: pd.DataFrame, max_score: float = 40.0) -> pd.Series:
    """
    [지표1] 저평가 점수 (최대 40점)

    PER 20점: 낮을수록 고점수 (적자·버블 제외)
    PBR 20점: 낮을수록 고점수 (PBR 없으면 ROE 대체)

    이상값 제거: PER≤0, PER>200, PBR≤0, PBR>20
    """
    logger.info("📐 [지표1] 저평가 점수 계산 중...")
    if fund_df.empty:
        logger.warning("  ⚠️ 기본지표 없음 → 저평가 0점")
        return pd.Series(dtype=float).rename("valuation_score")

    scale = (max_score / 2) / 100  # 20점 스케일

    # PER
    if "PER" in fund_df.columns:
        per = fund_df["PER"].copy().astype(float)
        per[per <= 0]  = np.nan
        per[per > 200] = np.nan
    else:
        per = pd.Series(np.nan, index=fund_df.index)

    # PBR (없으면 ROE 대체)
    pbr_source  = "없음"
    pbr_higher  = False
    if "PBR" in fund_df.columns:
        pbr = fund_df["PBR"].copy().astype(float)
        pbr[pbr <= 0]  = np.nan
        pbr[pbr > 20]  = np.nan
        if pbr.notna().sum() >= 10:
            pbr_source = "PBR"
        elif "ROE" in fund_df.columns:
            pbr = fund_df["ROE"].copy().astype(float)
            pbr[pbr <= 0] = np.nan
            pbr_source = "ROE(대체)"; pbr_higher = True
    elif "ROE" in fund_df.columns:
        pbr = fund_df["ROE"].copy().astype(float)
        pbr[pbr <= 0] = np.nan
        pbr_source = "ROE(대체)"; pbr_higher = True
    else:
        pbr = pd.Series(np.nan, index=fund_df.index)

    logger.info(f"  PER유효={per.notna().sum()} | PBR소스={pbr_source}({pbr.notna().sum()})")

    per_s = _percentile_score(per, False) * scale
    pbr_s = _percentile_score(pbr, pbr_higher) * scale

    idx = per_s.index.union(pbr_s.index)
    val = per_s.reindex(idx).fillna(0) + pbr_s.reindex(idx).fillna(0)
    logger.info(f"  ✅ 저평가 완료: 유효={( val>0).sum()} | 평균={val[val>0].mean():.2f} | 최고={val.max():.2f}")
    return val.rename("valuation_score")


def calc_supply_demand_score(investor_df: pd.DataFrame, max_score: float = 40.0) -> pd.Series:
    """
    [지표2] 수급 점수 (최대 40점)

    기관 5일 누적 순매수 20점: 상위 백분위일수록 고점수
    외국인 5일 누적 순매수 20점: 상위 백분위일수록 고점수
    """
    logger.info("💹 [지표2] 수급 점수 계산 중...")
    if investor_df is None or investor_df.empty:
        logger.warning("  ⚠️ 수급 데이터 없음 → 수급 0점")
        return pd.Series(dtype=float).rename("supply_demand_score")

    scale = (max_score / 2) / 100

    inst = investor_df.get("기관누적", pd.Series(np.nan, index=investor_df.index)).astype(float)
    frgn = investor_df.get("외국인누적", pd.Series(np.nan, index=investor_df.index)).astype(float)

    logger.info(f"  기관유효={inst.notna().sum()} | 외국인유효={frgn.notna().sum()}")

    inst_s = _percentile_score(inst, True) * scale
    frgn_s = _percentile_score(frgn, True) * scale

    idx = inst_s.index.union(frgn_s.index)
    sd  = inst_s.reindex(idx).fillna(0) + frgn_s.reindex(idx).fillna(0)
    logger.info(f"  ✅ 수급 완료: 유효={(sd>0).sum()} | 평균={sd[sd>0].mean():.2f} | 최고={sd.max():.2f}")
    return sd.rename("supply_demand_score")


def calc_technical_score(ohlcv_dict: dict, max_score: float = 20.0, vol_threshold: float = 1.5) -> pd.Series:
    """
    [지표3] 기술적 점수 (최대 20점)

    ① 거래량 급증 (10점): 최근 5일 평균 ÷ 직전 20일 평균 ≥ vol_threshold
    ② 이동평균 정배열 (10점): 5MA > 20MA > 60MA
    """
    logger.info("📊 [지표3] 기술적 점수 계산 중...")
    if not ohlcv_dict:
        logger.warning("  ⚠️ OHLCV 없음 → 기술 0점")
        return pd.Series(dtype=float).rename("tech_score")

    half = max_score / 2   # 10점
    scores = {}
    vol_cnt = ma_cnt = 0

    for code, df in ohlcv_dict.items():
        score = 0.0
        vol_col   = next((c for c in df.columns if "거래량" in c or c.lower() == "volume"), None)
        close_col = next((c for c in df.columns if "종가" in c   or c.lower() == "close"),  None)

        if vol_col is None or close_col is None or len(df) < 60:
            scores[code] = 0.0
            continue

        close  = df[close_col].astype(float)
        volume = df[vol_col].astype(float)

        # ① 거래량 급증
        recent   = volume.iloc[-5:].mean()
        baseline = volume.iloc[-25:-5].mean()
        if baseline > 0 and not np.isnan(baseline) and recent / baseline >= vol_threshold:
            score += half
            vol_cnt += 1

        # ② MA 정배열
        ma5  = close.rolling(5).mean().iloc[-1]
        ma20 = close.rolling(20).mean().iloc[-1]
        ma60 = close.rolling(60).mean().iloc[-1]
        if pd.notna(ma5) and pd.notna(ma20) and pd.notna(ma60) and ma5 > ma20 > ma60:
            score += half
            ma_cnt += 1

        scores[code] = score

    result = pd.Series(scores).rename("tech_score")
    logger.info(
        f"  ✅ 기술 완료: {len(result)}개 | "
        f"거래량급증={vol_cnt} | MA정배열={ma_cnt} | 만점={( result==max_score).sum()}"
    )
    return result


def combine_scores(
    stock_list: pd.DataFrame,
    val_score: pd.Series,
    sd_score: pd.Series,
    tech_score: pd.Series,
    fund_df: pd.DataFrame,
    investor_df: pd.DataFrame,
    top_n: int = 10,
) -> pd.DataFrame:
    """
    3가지 점수 합산 → 상위 top_n 종목 반환 (100점 만점).

    총점 = 저평가(40) + 수급(40) + 기술(20)
    """
    logger.info(f"🏆 종합 합산 → 상위 {top_n}개 선정 중...")

    base = stock_list.set_index("Code")[["Name", "Market", "시가총액"]].copy()
    base = base.join(val_score.rename("저평가"),  how="left")
    base = base.join(sd_score.rename("수급"),     how="left")
    base = base.join(tech_score.rename("기술"),   how="left")
    base[["저평가", "수급", "기술"]] = base[["저평가", "수급", "기술"]].fillna(0.0)
    base["총점"] = base["저평가"] + base["수급"] + base["기술"]

    # 기본지표 추가
    if fund_df is not None and not fund_df.empty:
        for col in ["PER", "PBR", "ROE", "외국인비율"]:
            if col in fund_df.columns:
                base = base.join(fund_df[[col]], how="left")

    # 수급 원시 데이터 추가
    if investor_df is not None and not investor_df.empty:
        for col in ["기관누적", "외국인누적"]:
            if col in investor_df.columns:
                base = base.join(investor_df[[col]], how="left")

    valid = base[base["총점"] > 0].copy()
    if valid.empty:
        valid = base[base["기술"] > 0].copy()
        logger.warning("  ⚠️ 비상 모드: 기술점수 종목만 선정")

    top = (
        valid
        .sort_values("총점", ascending=False)
        .head(top_n)
        .reset_index()
        .rename(columns={"Code": "종목코드", "Name": "종목명"})
    )
    top.insert(0, "순위", range(1, len(top) + 1))

    logger.info(f"✅ 상위 {len(top)}개 선정 완료!")
    if not top.empty:
        r0 = top.iloc[0]
        logger.info(
            f"  1위: {r0['종목명']} "
            f"(총점={r0['총점']:.2f}, 저평가={r0['저평가']:.2f}, "
            f"수급={r0['수급']:.2f}, 기술={r0['기술']:.2f})"
        )
    return top


# ==============================================================================
# 3단계: 출력 및 저장
# ==============================================================================

def _fmt(val, digits=2, suffix=""):
    """NaN 안전 포맷팅."""
    if val is None or (isinstance(val, float) and (np.isnan(val) or np.isinf(val))):
        return "-"
    try:    return f"{float(val):,.{digits}f}{suffix}"
    except: return str(val)


def print_console_report(top_df: pd.DataFrame, trading_date: str) -> None:
    """콘솔에 컬러 테이블로 결과를 출력한다."""
    fmt_date = f"{trading_date[:4]}-{trading_date[4:6]}-{trading_date[6:]}"

    print()
    print(Fore.CYAN + "═" * 74)
    print(Fore.CYAN + "  🇰🇷  KRX 퀀트 투자 스코어링 시스템 v3 — 투자 유망 상위 종목")
    print(Fore.CYAN + f"  📅 기준일: {fmt_date}  |  분석완료: {datetime.now().strftime('%H:%M:%S')}")
    print(Fore.CYAN + "═" * 74)

    priority = ["순위", "종목코드", "종목명", "Market", "총점", "저평가", "수급", "기술", "PER", "PBR", "ROE", "외국인비율"]
    cols = [c for c in priority if c in top_df.columns]
    disp = top_df[cols].copy()

    for col in ["총점", "저평가", "수급", "기술"]:
        if col in disp.columns:
            disp[col] = disp[col].apply(lambda x: _fmt(x, 2))
    for col in ["PER", "PBR", "ROE"]:
        if col in disp.columns:
            disp[col] = disp[col].apply(lambda x: _fmt(x, 2))
    if "외국인비율" in disp.columns:
        disp["외국인비율"] = disp["외국인비율"].apply(lambda x: _fmt(x, 2, "%"))

    print(Fore.WHITE + tabulate(disp, headers="keys", tablefmt="fancy_grid", showindex=False, numalign="right", stralign="left"))

    print()
    print(Fore.YELLOW + "  📌 점수 구성 안내 (100점 만점)")
    print(Fore.YELLOW + "  ├─ 저평가(40점): PER·PBR 기준 하위 백분위 → 낮을수록 고점수")
    print(Fore.YELLOW + "  ├─ 수급  (40점): 최근 5거래일 기관·외국인 순매수 강도 상위")
    print(Fore.YELLOW + "  └─ 기술  (20점): 거래량 1.5배↑ 급증 + 5MA>20MA>60MA 정배열")
    print(Fore.YELLOW + "  ⚠️  본 정보는 투자 참고용이며 투자의 최종 책임은 본인에게 있습니다.")
    print(Fore.CYAN + "═" * 74)
    print()


def save_results(top_df: pd.DataFrame, trading_date: str) -> None:
    """결과를 CSV·JSON·TXT로 저장한다."""
    # CSV
    csv_path = OUTPUT_DIR / f"top10_{trading_date}.csv"
    top_df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    logger.info(f"💾 CSV 저장: {csv_path}")

    # JSON
    def _safe(v):
        if isinstance(v, (np.integer,)):     return int(v)
        if isinstance(v, (np.floating,)):
            f = float(v)
            return None if (np.isnan(f) or np.isinf(f)) else round(f, 4)
        if isinstance(v, float):
            return None if (np.isnan(v) or np.isinf(v)) else round(v, 4)
        return v

    json_path = OUTPUT_DIR / f"top10_{trading_date}.json"
    data = {
        "trading_date":  trading_date,
        "generated_at":  datetime.now().isoformat(),
        "total_records": len(top_df),
        "top_stocks":    [{k: _safe(v) for k, v in row.items()} for _, row in top_df.iterrows()],
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"💾 JSON 저장: {json_path}")

    # TXT
    txt_path = OUTPUT_DIR / f"report_{trading_date}.txt"
    fmt_date = f"{trading_date[:4]}-{trading_date[4:6]}-{trading_date[6:]}"
    lines = [
        "=" * 62,
        "  KRX 퀀트 투자 유망 종목 분석 리포트 v3",
        f"  기준일: {fmt_date}",
        f"  생성:   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "=" * 62, "",
        "[ 상위 종목 요약 ]", "",
    ]
    for _, r in top_df.iterrows():
        lines.append(
            f"  {int(r.get('순위',0)):2d}위  [{r.get('Market','N/A')}] "
            f"{r.get('종목코드','N/A')}  {str(r.get('종목명','N/A')):<14s}"
            f"  총점={_fmt(r.get('총점',0),2)}"
        )
        lines.append(
            f"        저평가={_fmt(r.get('저평가',0),2)} | "
            f"수급={_fmt(r.get('수급',0),2)} | "
            f"기술={_fmt(r.get('기술',0),2)}"
        )
        details = []
        for col, lbl in [("PER","PER"),("PBR","PBR"),("ROE","ROE%")]:
            if col in r and pd.notna(r[col]):
                details.append(f"{lbl}={_fmt(r[col],2)}")
        if "기관누적" in r and pd.notna(r.get("기관누적")):
            details.append(f"기관5일={int(r['기관누적']):+,}")
        if "외국인누적" in r and pd.notna(r.get("외국인누적")):
            details.append(f"외인5일={int(r['외국인누적']):+,}")
        if details:
            lines.append(f"        └─ {' | '.join(details)}")
        lines.append("")
    lines += [
        "[ 점수 기준 ]",
        "  ├─ 저평가(40점): PER·PBR 하위 백분위 (낮을수록 저평가)",
        "  ├─ 수급  (40점): 5일 기관·외국인 순매수 강도",
        "  └─ 기술  (20점): 거래량 급증 + 이동평균 정배열",
        "",
        "  ※ 투자 결정의 책임은 본인에게 있습니다.",
        "=" * 62,
    ]
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    logger.info(f"💾 리포트 저장: {txt_path}")

    print(Fore.GREEN + f"  ✅ CSV   : {csv_path}")
    print(Fore.GREEN + f"  ✅ JSON  : {json_path}")
    print(Fore.GREEN + f"  ✅ 리포트: {txt_path}")


# ==============================================================================
# 예외 처리 래퍼
# ==============================================================================

def handle_exception(error: Exception, context: str = "") -> None:
    """사용자 친화적인 오류 안내를 출력한다."""
    print()
    print(Fore.RED + "━" * 62)
    print(Fore.RED + f"  ❌ 오류 발생: {context}")
    print(Fore.RED + f"  └─ {type(error).__name__}: {error}")
    err = str(error).lower()
    if any(k in err for k in ["비어", "empty", "none", "비거래", "holiday"]):
        print(Fore.YELLOW + f"\n  📅 비거래일이거나 장 개시 전일 수 있습니다.")
        prev = (datetime.today() - timedelta(days=3)).strftime("%Y%m%d")
        print(Fore.YELLOW + f"     python krx_quant_all_in_one.py --date {prev}")
    if any(k in err for k in ["connection", "timeout", "network"]):
        print(Fore.YELLOW + "\n  🌐 네트워크 연결 문제. 잠시 후 다시 시도하세요.")
    print(Fore.RED + "━" * 62)
    logger.debug(traceback.format_exc())


# ==============================================================================
# 메인 파이프라인
# ==============================================================================

def run_pipeline(
    target_date: str = None,
    market: str = "ALL",
    top_n: int = 10,
    max_stocks: int = 300,
    fast_mode: bool = False,
) -> None:
    """
    데이터 수집 → 스코어링 → 출력까지 전체 파이프라인.

    Parameters
    ----------
    target_date : 분석 기준일 YYYYMMDD (None이면 자동 탐지)
    market      : KOSPI | KOSDAQ | ALL
    top_n       : 상위 종목 수
    max_stocks  : OHLCV 수집 최대 종목 수
    fast_mode   : True이면 PBR·수급 수집 생략 (빠른 테스트용)
    """
    print()
    print(Fore.CYAN + "═" * 62)
    print(Fore.CYAN + "  🚀 KRX 퀀트 투자 스코어링 시스템 v3 시작")
    print(Fore.CYAN + f"  ⏱  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(Fore.CYAN + f"  🎯  시장={market} | 상위={top_n}개 | 최대종목={max_stocks}개")
    if fast_mode:
        print(Fore.YELLOW + "  ⚡ 빠른 모드: PBR·수급 수집 생략")
    print(Fore.CYAN + "═" * 62)

    # ── [1/6] 거래일 확인 ────────────────────────────────────────────────
    print(Fore.WHITE + "\n  [1/6] 최근 거래일 확인 중...")
    try:
        trading_date = target_date or get_last_trading_date()
    except Exception as e:
        handle_exception(e, "거래일 확인")
        sys.exit(1)

    start_60d = n_trading_days_before(trading_date, 70)
    logger.info(f"기준일={trading_date} | OHLCV시작={start_60d}")

    # ── [2/6] 종목 리스트 ───────────────────────────────────────────────
    print(Fore.WHITE + "\n  [2/6] 전체 종목 리스트 수집 중...")
    try:
        stock_list = fetch_stock_list(market)
        stock_list = stock_list.sort_values("시가총액", ascending=False).reset_index(drop=True)
        codes      = stock_list["Code"].tolist()
    except Exception as e:
        handle_exception(e, "종목 리스트 수집")
        sys.exit(1)

    # ── [3/6] 기본지표 ──────────────────────────────────────────────────
    print(Fore.WHITE + "\n  [3/6] 기본지표(PER·PBR·ROE) 수집 중...")
    try:
        fund_df = fetch_per_roe_data(max_pages=60)

        if not fast_mode and not fund_df.empty:
            pbr_target = [c for c in codes if c in fund_df.index][:300]
            if pbr_target:
                pbr = fetch_pbr_for_codes(pbr_target, max_codes=300)
                fund_df = fund_df.join(pbr, how="left")
        else:
            fund_df["PBR"] = np.nan
    except Exception as e:
        handle_exception(e, "기본지표 수집")
        logger.warning("⚠️ 기본지표 없이 계속 (저평가 점수 = 0)")
        fund_df = pd.DataFrame()

    # ── [4/6] 기관·외국인 순매수 ────────────────────────────────────────
    investor_df = pd.DataFrame()
    if not fast_mode:
        print(Fore.WHITE + "\n  [4/6] 기관·외국인 순매수 수집 중 (최근 5일)...")
        try:
            investor_df = fetch_investor_net_buy(codes, days=5, max_codes=max_stocks)
        except Exception as e:
            handle_exception(e, "수급 데이터 수집")
            logger.warning("⚠️ 수급 데이터 없이 계속 (수급 점수 = 0)")
    else:
        print(Fore.YELLOW + "\n  [4/6] ⚡ 빠른 모드: 수급 수집 생략")

    # ── [5/6] OHLCV ────────────────────────────────────────────────────
    print(Fore.WHITE + f"\n  [5/6] OHLCV 수집 중 (최대 {max_stocks}개)...")
    try:
        ohlcv_dict = fetch_ohlcv_bulk(codes, start_60d, trading_date, max_codes=max_stocks)
    except Exception as e:
        handle_exception(e, "OHLCV 수집")
        logger.warning("⚠️ OHLCV 없이 계속 (기술 점수 = 0)")
        ohlcv_dict = {}

    # ── [6/6] 스코어링 + 출력 ────────────────────────────────────────
    print(Fore.WHITE + "\n  [6/6] 스코어링(점수화) 진행 중...")

    val_score  = calc_valuation_score(fund_df)    if not fund_df.empty     else pd.Series(dtype=float)
    sd_score   = calc_supply_demand_score(investor_df) if not investor_df.empty else pd.Series(dtype=float)
    tech_score = calc_technical_score(ohlcv_dict) if ohlcv_dict            else pd.Series(dtype=float)

    try:
        top_df = combine_scores(stock_list, val_score, sd_score, tech_score, fund_df, investor_df, top_n)
    except Exception as e:
        handle_exception(e, "종합 점수 계산")
        sys.exit(1)

    if top_df.empty:
        print(Fore.YELLOW + "\n  ⚠️ 조건에 맞는 종목이 없습니다.")
        sys.exit(0)

    print_console_report(top_df, trading_date)
    save_results(top_df, trading_date)


# ==============================================================================
# CLI
# ==============================================================================

def parse_args():
    parser = argparse.ArgumentParser(
        description="KRX 퀀트 투자 스코어링 시스템 v3",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  python krx_quant_all_in_one.py                     기본 실행
  python krx_quant_all_in_one.py --date 20260410      특정 날짜
  python krx_quant_all_in_one.py --market KOSPI       KOSPI만 분석
  python krx_quant_all_in_one.py --top 20             상위 20개
  python krx_quant_all_in_one.py --max-stocks 200     최대 200개
  python krx_quant_all_in_one.py --fast               빠른 모드
        """,
    )
    parser.add_argument("--date",       type=str, default=None,  help="분석 기준일 YYYYMMDD")
    parser.add_argument("--market",     type=str, default="ALL", choices=["KOSPI","KOSDAQ","ALL"])
    parser.add_argument("--top",        type=int, default=10,    help="상위 종목 수 (기본 10)")
    parser.add_argument("--max-stocks", type=int, default=300,   help="OHLCV 최대 종목 수 (기본 300)")
    parser.add_argument("--fast",       action="store_true",     help="빠른 모드 (PBR·수급 생략)")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_pipeline(
        target_date=args.date,
        market=args.market,
        top_n=args.top,
        max_stocks=args.max_stocks,
        fast_mode=args.fast,
    )
