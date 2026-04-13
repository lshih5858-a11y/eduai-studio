"""
==============================================================================
[3단계] 최종 출력 및 리포팅 모듈 (output/reporter.py) — v3
==============================================================================

■ CoT 3단계: 최종 상위 10개 출력부 설계
  1) 콘솔(터미널)에 컬러 테이블로 결과 출력
  2) CSV 파일로 결과 저장 (날짜별 파일명)
  3) JSON 형식으로도 저장 (API 연동 대비)
  4) 요약 리포트 텍스트 파일 저장

■ v3 변경사항
  - 컬럼명을 한글로 통일 (총점, 저평가, 수급, 기술)
  - 기관누적·외국인누적 수급 원시 데이터도 출력에 포함
  - NaN 안전 처리 강화

==============================================================================
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd
import numpy as np
from tabulate import tabulate
from colorama import Fore, Style, init as colorama_init

# colorama 초기화 (Windows/Linux 호환)
colorama_init(autoreset=True)

logger = logging.getLogger(__name__)

# 출력 디렉토리 경로 (krx_quant/output/)
OUTPUT_DIR = Path(__file__).parent.parent / "output"


def _ensure_output_dir() -> None:
    """출력 디렉토리가 없으면 생성한다."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def _fmt_num(val, digits: int = 2, suffix: str = "") -> str:
    """float 값을 안전하게 포맷팅한다. NaN이면 '-' 반환."""
    if val is None or (isinstance(val, float) and (np.isnan(val) or np.isinf(val))):
        return "-"
    try:
        return f"{float(val):,.{digits}f}{suffix}"
    except (TypeError, ValueError):
        return str(val)


# =============================================================================
# 콘솔 출력
# =============================================================================

def print_console_report(top_df: pd.DataFrame, trading_date: str) -> None:
    """
    선정된 상위 종목을 터미널에 컬러 테이블로 출력한다.

    Parameters
    ----------
    top_df       : combine_scores() 반환 DataFrame
                   columns=[순위, 종목코드, 종목명, Market, 총점, 저평가, 수급, 기술, PER, PBR, ...]
    trading_date : 기준 거래일 (YYYYMMDD)
    """
    fmt_date = f"{trading_date[:4]}-{trading_date[4:6]}-{trading_date[6:]}"

    # ── 헤더 출력 ────────────────────────────────────────────────────────────
    print()
    print(Fore.CYAN + "═" * 74)
    print(Fore.CYAN + "  🇰🇷  KRX 퀀트 투자 스코어링 시스템 — 투자 유망 상위 종목")
    print(Fore.CYAN + f"  📅 기준일: {fmt_date}  |  분석완료: {datetime.now().strftime('%H:%M:%S')}")
    print(Fore.CYAN + "═" * 74)

    # ── 출력용 DataFrame 가공 ────────────────────────────────────────────────
    # 표시할 컬럼 우선순위 정의
    priority_cols = [
        "순위", "종목코드", "종목명", "Market",
        "총점", "저평가", "수급", "기술",
        "PER", "PBR", "ROE", "외국인비율"
    ]

    # 실제 존재하는 컬럼만 선택
    display_cols = [c for c in priority_cols if c in top_df.columns]
    disp_df = top_df[display_cols].copy()

    # 수치 포맷팅
    for col in ["총점", "저평가", "수급", "기술"]:
        if col in disp_df.columns:
            disp_df[col] = disp_df[col].apply(lambda x: _fmt_num(x, 2))

    for col in ["PER", "PBR", "ROE"]:
        if col in disp_df.columns:
            disp_df[col] = disp_df[col].apply(lambda x: _fmt_num(x, 2))

    if "외국인비율" in disp_df.columns:
        disp_df["외국인비율"] = disp_df["외국인비율"].apply(
            lambda x: _fmt_num(x, 2, "%")
        )

    if "시가총액" in disp_df.columns:
        disp_df["시가총액"] = disp_df["시가총액"].apply(
            lambda x: f"{float(x)/1e8:,.0f}억" if pd.notna(x) and x else "-"
        )

    # ── tabulate 출력 ────────────────────────────────────────────────────────
    table_str = tabulate(
        disp_df,
        headers="keys",
        tablefmt="fancy_grid",
        showindex=False,
        numalign="right",
        stralign="left",
    )
    print(Fore.WHITE + table_str)

    # ── 범례 출력 ────────────────────────────────────────────────────────────
    print()
    print(Fore.YELLOW + "  📌 점수 구성 안내 (100점 만점)")
    print(Fore.YELLOW + "  ├─ 저평가(40점): PER·PBR 기준 하위 백분위 → 낮을수록 고점수")
    print(Fore.YELLOW + "  ├─ 수급  (40점): 최근 5거래일 기관·외국인 순매수 강도 상위")
    print(Fore.YELLOW + "  └─ 기술  (20점): 거래량 1.5배↑ 급증 + 5MA>20MA>60MA 정배열")
    print(Fore.YELLOW + "  ⚠️  본 정보는 투자 참고용이며 투자의 최종 책임은 본인에게 있습니다.")
    print(Fore.CYAN + "═" * 74)
    print()


# =============================================================================
# CSV 저장
# =============================================================================

def save_csv(top_df: pd.DataFrame, trading_date: str) -> str:
    """
    결과를 CSV 파일로 저장한다.

    Parameters
    ----------
    top_df       : 결과 DataFrame
    trading_date : 기준 거래일 (YYYYMMDD)

    Returns
    -------
    str : 저장된 파일 경로
    """
    _ensure_output_dir()
    filename = OUTPUT_DIR / f"top10_{trading_date}.csv"
    top_df.to_csv(filename, index=False, encoding="utf-8-sig")
    logger.info(f"💾 CSV 저장 완료: {filename}")
    return str(filename)


# =============================================================================
# JSON 저장
# =============================================================================

def save_json(top_df: pd.DataFrame, trading_date: str) -> str:
    """
    결과를 JSON 파일로 저장한다.
    NaN / Inf / numpy 타입을 안전하게 직렬화한다.

    Parameters
    ----------
    top_df       : 결과 DataFrame
    trading_date : 기준 거래일 (YYYYMMDD)

    Returns
    -------
    str : 저장된 파일 경로
    """
    _ensure_output_dir()
    filename = OUTPUT_DIR / f"top10_{trading_date}.json"

    def _safe(val):
        """JSON 직렬화 불가 값을 None으로 변환한다."""
        if isinstance(val, (np.integer,)):
            return int(val)
        if isinstance(val, (np.floating,)):
            v = float(val)
            return None if (np.isnan(v) or np.isinf(v)) else round(v, 4)
        if isinstance(val, float):
            return None if (np.isnan(val) or np.isinf(val)) else round(val, 4)
        if val is None:
            return None
        return val

    records = []
    for _, row in top_df.iterrows():
        records.append({k: _safe(v) for k, v in row.items()})

    data = {
        "trading_date":  trading_date,
        "generated_at":  datetime.now().isoformat(),
        "total_records": len(records),
        "top_stocks":    records,
    }

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    logger.info(f"💾 JSON 저장 완료: {filename}")
    return str(filename)


# =============================================================================
# 텍스트 요약 리포트 저장
# =============================================================================

def save_text_report(top_df: pd.DataFrame, trading_date: str) -> str:
    """
    사람이 읽기 쉬운 텍스트 요약 리포트를 파일로 저장한다.

    Parameters
    ----------
    top_df       : 결과 DataFrame
    trading_date : 기준 거래일 (YYYYMMDD)

    Returns
    -------
    str : 저장된 파일 경로
    """
    _ensure_output_dir()
    filename = OUTPUT_DIR / f"report_{trading_date}.txt"
    fmt_date = f"{trading_date[:4]}-{trading_date[4:6]}-{trading_date[6:]}"

    lines = []
    lines.append("=" * 62)
    lines.append("  KRX 퀀트 투자 유망 종목 분석 리포트 v3")
    lines.append(f"  기준일 : {fmt_date}")
    lines.append(f"  생성일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("=" * 62)
    lines.append("")
    lines.append("[ 상위 종목 요약 ]")
    lines.append("")

    for _, row in top_df.iterrows():
        rank     = int(row.get("순위", 0))
        code     = row.get("종목코드", "N/A")
        name     = str(row.get("종목명", "N/A"))
        market   = row.get("Market", "N/A")
        total    = row.get("총점", 0)
        val_s    = row.get("저평가", 0)
        sd_s     = row.get("수급", 0)
        tech_s   = row.get("기술", 0)

        lines.append(
            f"  {rank:2d}위  [{market}] {code}  {name:<14s}"
            f"  총점={_fmt_num(total, 2)}"
        )
        lines.append(
            f"        저평가={_fmt_num(val_s, 2)} | 수급={_fmt_num(sd_s, 2)} | 기술={_fmt_num(tech_s, 2)}"
        )

        details = []
        if "PER" in row and pd.notna(row["PER"]):
            details.append(f"PER={_fmt_num(row['PER'], 2)}")
        if "PBR" in row and pd.notna(row["PBR"]):
            details.append(f"PBR={_fmt_num(row['PBR'], 2)}")
        if "ROE" in row and pd.notna(row["ROE"]):
            details.append(f"ROE={_fmt_num(row['ROE'], 2)}%")
        if "기관누적" in row and pd.notna(row.get("기관누적")):
            details.append(f"기관5일={int(row['기관누적']):+,}주")
        if "외국인누적" in row and pd.notna(row.get("외국인누적")):
            details.append(f"외인5일={int(row['외국인누적']):+,}주")
        if details:
            lines.append(f"        └─ {' | '.join(details)}")
        lines.append("")

    lines.append("[ 점수 구성 기준 (100점 만점) ]")
    lines.append("  ├─ 저평가 (40점): PER·PBR 기준 하위 백분위 종목일수록 고점수")
    lines.append("  │               PBR 없을 경우 ROE 역전 지표로 대체")
    lines.append("  ├─ 수급   (40점): 최근 5거래일 기관·외국인 순매수 강도")
    lines.append("  │               데이터 소스: 네이버 금융 개별 종목 페이지")
    lines.append("  └─ 기술   (20점): 거래량 1.5배↑ 급증(10점)")
    lines.append("                   + 5MA>20MA>60MA 이동평균 정배열(10점)")
    lines.append("")
    lines.append("  ※ 본 정보는 투자 참고용이며 투자 결정의 책임은 본인에게 있습니다.")
    lines.append("=" * 62)

    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    logger.info(f"💾 텍스트 리포트 저장 완료: {filename}")
    return str(filename)
