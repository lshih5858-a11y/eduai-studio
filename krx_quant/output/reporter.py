"""
==============================================================================
[3단계] 최종 출력 및 리포팅 모듈 (output/reporter.py)
==============================================================================

■ CoT 3단계: 최종 상위 10개 출력부 설계
  1) 콘솔(터미널)에 컬러 테이블로 결과 출력
  2) CSV 파일로 결과 저장 (날짜별 파일명)
  3) JSON 형식으로도 저장 (API 연동 대비)
  4) 요약 리포트 텍스트 파일 저장

==============================================================================
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd
from tabulate import tabulate
from colorama import Fore, Style, init as colorama_init

# colorama 초기화 (Windows 호환)
colorama_init(autoreset=True)

logger = logging.getLogger(__name__)

# 출력 디렉토리 경로
OUTPUT_DIR = Path(__file__).parent.parent / "output"


def _ensure_output_dir():
  """출력 디렉토리가 없으면 생성한다."""
  OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ─────────────────────────────────────────────────────────────────────────────
# 콘솔 출력
# ─────────────────────────────────────────────────────────────────────────────

def print_console_report(top_df: pd.DataFrame, trading_date: str):
  """
  선정된 상위 종목을 터미널에 컬러 테이블로 출력한다.

  Parameters
  ----------
  top_df       : combine_scores() 의 반환 DataFrame
  trading_date : 기준 거래일 (YYYYMMDD)
  """
  # 날짜 포맷 변환 (YYYYMMDD → YYYY-MM-DD)
  fmt_date = f"{trading_date[:4]}-{trading_date[4:6]}-{trading_date[6:]}"

  # ── 헤더 출력 ────────────────────────────────────────────────────────
  print()
  print(Fore.CYAN + "=" * 72)
  print(Fore.CYAN + "  🇰🇷  KRX 퀀트 투자 스코어링 시스템 — 투자 유망 상위 10개 종목")
  print(Fore.CYAN + f"  📅 기준일: {fmt_date}  |  분석 시간: {datetime.now().strftime('%H:%M:%S')}")
  print(Fore.CYAN + "=" * 72)

  # ── 출력 컬럼 선택 ────────────────────────────────────────────────────
  display_cols = ["순위", "종목코드", "종목명", "Market", "total_score",
                  "valuation_score", "momentum_score", "tech_score"]
  if "PER" in top_df.columns:
    display_cols.append("PER")
  if "PBR" in top_df.columns:
    display_cols.append("PBR")
  if "시가총액" in top_df.columns:
    display_cols.append("시가총액")

  # 실제로 존재하는 컬럼만 선택
  display_cols = [c for c in display_cols if c in top_df.columns]
  disp_df = top_df[display_cols].copy()

  # 소수점 정리
  for col in ["total_score", "valuation_score", "momentum_score", "tech_score"]:
    if col in disp_df.columns:
      disp_df[col] = disp_df[col].round(2)

  if "PER" in disp_df.columns:
    disp_df["PER"] = disp_df["PER"].round(2)
  if "PBR" in disp_df.columns:
    disp_df["PBR"] = disp_df["PBR"].round(2)
  if "시가총액" in disp_df.columns:
    disp_df["시가총액"] = disp_df["시가총액"].apply(
      lambda x: f"{x/1e8:,.0f}억" if pd.notna(x) and x > 0 else "-"
    )

  # 컬럼명 한글화
  col_rename = {
    "Market":           "시장",
    "total_score":      "총점",
    "valuation_score":  "저평가",
    "momentum_score":   "수급",
    "tech_score":       "기술",
  }
  disp_df.rename(columns=col_rename, inplace=True)

  # tabulate 출력
  table_str = tabulate(
    disp_df,
    headers="keys",
    tablefmt="fancy_grid",
    showindex=False,
    numalign="right",
    stralign="left",
  )
  print(Fore.WHITE + table_str)

  # ── 범례 출력 ────────────────────────────────────────────────────────
  print()
  print(Fore.YELLOW + "  📌 점수 구성 안내 (100점 만점)")
  print(Fore.YELLOW + "  ├─ 저평가(40점): PER·PBR 기준 하위 백분위 종목일수록 고점수")
  print(Fore.YELLOW + "  ├─ 수급(40점)  : 최근 5거래일 기관·외국인 순매수 강도")
  print(Fore.YELLOW + "  └─ 기술(20점)  : 거래량 급증(1.5배 이상) + 이동평균 정배열")
  print(Fore.YELLOW + "  ⚠️  본 정보는 투자 참고용이며 투자 결정의 책임은 본인에게 있습니다.")
  print(Fore.CYAN + "=" * 72)
  print()


# ─────────────────────────────────────────────────────────────────────────────
# CSV 저장
# ─────────────────────────────────────────────────────────────────────────────

def save_csv(top_df: pd.DataFrame, trading_date: str) -> str:
  """
  결과를 CSV 파일로 저장한다.

  Returns
  -------
  str  저장된 파일 경로
  """
  _ensure_output_dir()
  filename = OUTPUT_DIR / f"top10_{trading_date}.csv"
  top_df.to_csv(filename, index=False, encoding="utf-8-sig")
  logger.info(f"💾 CSV 저장 완료: {filename}")
  return str(filename)


# ─────────────────────────────────────────────────────────────────────────────
# JSON 저장
# ─────────────────────────────────────────────────────────────────────────────

def save_json(top_df: pd.DataFrame, trading_date: str) -> str:
  """
  결과를 JSON 파일로 저장한다.

  Returns
  -------
  str  저장된 파일 경로
  """
  _ensure_output_dir()
  filename = OUTPUT_DIR / f"top10_{trading_date}.json"

  records = top_df.copy()
  # NaN → None 변환 (JSON 직렬화 호환)
  records = records.where(records.notna(), other=None)
  data = {
    "trading_date": trading_date,
    "generated_at": datetime.now().isoformat(),
    "top10": records.to_dict(orient="records"),
  }
  with open(filename, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

  logger.info(f"💾 JSON 저장 완료: {filename}")
  return str(filename)


# ─────────────────────────────────────────────────────────────────────────────
# 텍스트 요약 리포트 저장
# ─────────────────────────────────────────────────────────────────────────────

def save_text_report(top_df: pd.DataFrame, trading_date: str) -> str:
  """
  사람이 읽기 쉬운 텍스트 요약 리포트를 저장한다.

  Returns
  -------
  str  저장된 파일 경로
  """
  _ensure_output_dir()
  filename = OUTPUT_DIR / f"report_{trading_date}.txt"
  fmt_date = f"{trading_date[:4]}-{trading_date[4:6]}-{trading_date[6:]}"

  lines = []
  lines.append("=" * 60)
  lines.append(f"  KRX 퀀트 투자 유망 종목 분석 리포트")
  lines.append(f"  기준일: {fmt_date}")
  lines.append(f"  생성일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
  lines.append("=" * 60)
  lines.append("")
  lines.append("[ 상위 10개 종목 요약 ]")
  lines.append("")

  for _, row in top_df.iterrows():
    lines.append(f"  {int(row['순위']):2d}위  {row.get('종목코드','N/A')}  "
                 f"{str(row.get('종목명','N/A')):<15s}  "
                 f"총점: {row.get('total_score', 0):.2f}점  "
                 f"시장: {row.get('Market','N/A')}")
    details = []
    if "PER" in row and pd.notna(row["PER"]):
      details.append(f"PER={row['PER']:.1f}")
    if "PBR" in row and pd.notna(row["PBR"]):
      details.append(f"PBR={row['PBR']:.2f}")
    if details:
      lines.append(f"        └─ {' | '.join(details)}")

  lines.append("")
  lines.append("[ 점수 기준 ]")
  lines.append("  - 저평가 (40점): PER·PBR 하위 백분위 종목일수록 고점수")
  lines.append("  - 수급   (40점): 기관·외국인 5일 순매수 강도")
  lines.append("  - 기술   (20점): 거래량 급증 + 이동평균 정배열")
  lines.append("")
  lines.append("  ※ 투자 결정의 책임은 투자자 본인에게 있습니다.")
  lines.append("=" * 60)

  with open(filename, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

  logger.info(f"💾 텍스트 리포트 저장 완료: {filename}")
  return str(filename)
