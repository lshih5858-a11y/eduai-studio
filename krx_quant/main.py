"""
==============================================================================
KRX 퀀트 투자 스코어링 시스템 — 메인 실행 파일 (main.py)
==============================================================================

■ 사용 방법
    python main.py                    # 기본 실행 (최근 거래일 자동 탐지)
    python main.py --date 20240315    # 특정 날짜 지정
    python main.py --market KOSPI     # 특정 시장만 분석 (KOSPI / KOSDAQ / ALL)
    python main.py --top 20           # 상위 N개 종목 선정

■ pip 설치 명령어 (처음 실행 전 한 번만 실행)
    pip install finance-datareader pykrx pandas numpy flask tabulate colorama requests

==============================================================================
"""

# ── 표준 라이브러리 ──────────────────────────────────────────────────────────
import sys
import argparse
import logging
import traceback
from datetime import datetime, timedelta

# ── 프로젝트 내부 모듈 ────────────────────────────────────────────────────────
# 현재 파일의 상위 폴더를 경로에 추가 (상대 import 지원)
import os
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
from krx_quant.output.reporter import (
  print_console_report,
  save_csv,
  save_json,
  save_text_report,
)

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


# ─────────────────────────────────────────────────────────────────────────────
# 예외 처리 래퍼
# ─────────────────────────────────────────────────────────────────────────────

def handle_exception(error: Exception, context: str = ""):
  """
  사용자에게 친화적인 오류 메시지를 출력하는 공통 예외 처리 함수.

  Parameters
  ----------
  error   : 발생한 예외 객체
  context : 어떤 단계에서 오류가 발생했는지 설명
  """
  from colorama import Fore, Style, init as colorama_init
  colorama_init(autoreset=True)

  print()
  print(Fore.RED + "━" * 60)
  print(Fore.RED + f"  ❌ 오류 발생: {context}")
  print(Fore.RED + f"  └─ {type(error).__name__}: {error}")

  # 공휴일·비거래일 감지
  err_str = str(error).lower()
  if any(kw in err_str for kw in ["비어", "empty", "none", "비거래", "holiday"]):
    print(Fore.YELLOW + "")
    print(Fore.YELLOW + "  📅 오늘은 장이 열리지 않는 날(공휴일·주말)이거나")
    print(Fore.YELLOW + "     아직 당일 데이터가 확정되지 않았을 수 있습니다.")
    print(Fore.YELLOW + "     --date 옵션으로 직전 거래일을 직접 지정해 보세요.")
    print(Fore.YELLOW + f"     예시: python main.py --date {(datetime.today() - timedelta(days=3)).strftime('%Y%m%d')}")

  # 네트워크 오류 감지
  if any(kw in err_str for kw in ["connection", "timeout", "network", "http", "ssl"]):
    print(Fore.YELLOW + "")
    print(Fore.YELLOW + "  🌐 네트워크 연결에 문제가 있거나 KRX 서버가 일시적으로")
    print(Fore.YELLOW + "     응답하지 않을 수 있습니다. 잠시 후 다시 시도해 주세요.")

  print(Fore.RED + "━" * 60)
  print()
  logger.debug(traceback.format_exc())


# ─────────────────────────────────────────────────────────────────────────────
# N 거래일 전 날짜 계산 헬퍼
# ─────────────────────────────────────────────────────────────────────────────

def n_trading_days_before(base_date: str, n: int) -> str:
  """
  base_date(YYYYMMDD) 로부터 n 거래일(주말 제외) 이전 날짜를 반환한다.
  """
  dt = datetime.strptime(base_date, "%Y%m%d")
  count = 0
  while count < n:
    dt -= timedelta(days=1)
    if dt.weekday() < 5:  # 월~금
      count += 1
  return dt.strftime("%Y%m%d")


# ─────────────────────────────────────────────────────────────────────────────
# 메인 파이프라인
# ─────────────────────────────────────────────────────────────────────────────

def run_pipeline(
  target_date: str | None = None,
  market: str = "ALL",
  top_n: int = 10,
  max_stocks: int = 300,
) -> None:
  """
  데이터 수집 → 스코어링 → 출력까지 전체 파이프라인을 실행한다.

  Parameters
  ----------
  target_date : 분석 기준일 (YYYYMMDD). None 이면 자동 탐지.
  market      : "KOSPI", "KOSDAQ", "ALL"
  top_n       : 출력할 상위 종목 수
  max_stocks  : OHLCV 수집 대상 최대 종목 수 (서버 부하 방지)
  """
  from colorama import Fore, Style, init as colorama_init
  colorama_init(autoreset=True)

  print()
  print(Fore.CYAN + "=" * 60)
  print(Fore.CYAN + "  🚀 KRX 퀀트 스코어링 시스템 시작")
  print(Fore.CYAN + f"  ⏱  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
  print(Fore.CYAN + "=" * 60)

  # ─────────────────────────────────────────────────────────────────
  # Step 1-A: 거래일 확인
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + "\n  [1/7] 최근 거래일 확인 중...")
  try:
    if target_date:
      trading_date = target_date
      logger.info(f"📅 사용자 지정 기준일: {trading_date}")
    else:
      trading_date = get_last_trading_date()
  except Exception as e:
    handle_exception(e, "거래일 확인")
    sys.exit(1)

  # 5거래일 전 시작일 계산 (수급 데이터용)
  start_date_5d = n_trading_days_before(trading_date, 5)
  # 60거래일 전 시작일 계산 (이동평균선용)
  start_date_60d = n_trading_days_before(trading_date, 70)  # 여유분 포함

  logger.info(f"기준일: {trading_date} | 5거래일 전: {start_date_5d} | 60거래일 전: {start_date_60d}")

  # ─────────────────────────────────────────────────────────────────
  # Step 1-B: 종목 리스트 수집
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + "\n  [2/7] 전체 종목 리스트 수집 중...")
  try:
    stock_list = fetch_stock_list(market=market)
  except Exception as e:
    handle_exception(e, "종목 리스트 수집")
    sys.exit(1)

  # ─────────────────────────────────────────────────────────────────
  # Step 1-C: 기본지표 수집 (PER, PBR)
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + "\n  [3/7] PER·PBR 기본지표 수집 중...")
  try:
    fund_df = fetch_fundamental_data(trading_date)
  except Exception as e:
    handle_exception(e, "기본지표(PER/PBR) 수집")
    logger.warning("⚠️ 기본지표 없이 계속 진행합니다 (저평가 점수 = 0)")
    import pandas as pd
    fund_df = pd.DataFrame()

  # ─────────────────────────────────────────────────────────────────
  # Step 1-D: 기관·외국인 순매수 수집
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + "\n  [4/7] 기관·외국인 순매수 데이터 수집 중...")
  try:
    investor_data = fetch_investor_trading(start_date_5d, trading_date)
  except Exception as e:
    handle_exception(e, "기관·외국인 순매수 수집")
    logger.warning("⚠️ 수급 데이터 없이 계속 진행합니다 (수급 점수 = 0)")
    investor_data = {}

  # ─────────────────────────────────────────────────────────────────
  # Step 1-E: OHLCV 수집 (이동평균, 거래량)
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + f"\n  [5/7] OHLCV 데이터 수집 중 (상위 {max_stocks}개 종목)...")
  try:
    code_list = stock_list["Code"].tolist()
    ohlcv_dict = fetch_ohlcv_bulk(code_list, start_date_60d, trading_date, max_codes=max_stocks)
  except Exception as e:
    handle_exception(e, "OHLCV 데이터 수집")
    logger.warning("⚠️ OHLCV 없이 계속 진행합니다 (기술적 점수 = 0)")
    ohlcv_dict = {}

  # ─────────────────────────────────────────────────────────────────
  # Step 1-F: 시가총액 수집
  # ─────────────────────────────────────────────────────────────────
  import pandas as pd
  try:
    market_cap_df = fetch_market_cap(trading_date)
  except Exception as e:
    logger.warning(f"⚠️ 시가총액 수집 실패: {e}")
    market_cap_df = pd.DataFrame()

  # ─────────────────────────────────────────────────────────────────
  # Step 2: 스코어링
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + "\n  [6/7] 스코어링(점수화) 진행 중...")

  # 저평가 점수
  if not fund_df.empty:
    val_score = calc_valuation_score(fund_df)
  else:
    val_score = pd.Series(dtype=float).rename("valuation_score")

  # 수급 점수
  if investor_data:
    mom_score = calc_momentum_score(investor_data)
  else:
    mom_score = pd.Series(dtype=float).rename("momentum_score")

  # 기술적 점수
  if ohlcv_dict:
    tech_score = calc_technical_score(ohlcv_dict)
  else:
    tech_score = pd.Series(dtype=float).rename("tech_score")

  # 종합 점수 합산 및 상위 top_n 선정
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
    handle_exception(e, "종합 점수 계산")
    sys.exit(1)

  if top_df.empty:
    print(Fore.YELLOW + "\n  ⚠️ 조건에 맞는 종목이 없습니다.")
    print(Fore.YELLOW + "     데이터 수집 범위를 넓히거나 기준일을 변경해 보세요.")
    sys.exit(0)

  # ─────────────────────────────────────────────────────────────────
  # Step 3: 출력 및 저장
  # ─────────────────────────────────────────────────────────────────
  print(Fore.WHITE + "\n  [7/7] 결과 출력 및 저장 중...")

  # 콘솔 출력
  print_console_report(top_df, trading_date)

  # 파일 저장
  csv_path  = save_csv(top_df, trading_date)
  json_path = save_json(top_df, trading_date)
  txt_path  = save_text_report(top_df, trading_date)

  print(Fore.GREEN + f"  ✅ 분석 완료!")
  print(Fore.GREEN + f"  📁 CSV  저장: {csv_path}")
  print(Fore.GREEN + f"  📁 JSON 저장: {json_path}")
  print(Fore.GREEN + f"  📁 리포트 : {txt_path}")
  print()


# ─────────────────────────────────────────────────────────────────────────────
# CLI 인자 파싱
# ─────────────────────────────────────────────────────────────────────────────

def parse_args():
  """커맨드라인 인자를 파싱한다."""
  parser = argparse.ArgumentParser(
    description="KRX 퀀트 투자 스코어링 시스템 — 투자 유망 상위 N개 종목 선정",
    formatter_class=argparse.RawDescriptionHelpFormatter,
    epilog="""
사용 예시:
  python main.py                        기본 실행 (최근 거래일 자동 탐지)
  python main.py --date 20240315        특정 날짜 지정
  python main.py --market KOSPI         KOSPI만 분석
  python main.py --top 20               상위 20개 종목 선정
  python main.py --max-stocks 500       최대 500개 종목 OHLCV 수집
    """,
  )
  parser.add_argument(
    "--date", type=str, default=None,
    help="분석 기준일 (YYYYMMDD). 미입력 시 자동 탐지",
  )
  parser.add_argument(
    "--market", type=str, default="ALL",
    choices=["KOSPI", "KOSDAQ", "ALL"],
    help="분석 대상 시장 (기본값: ALL)",
  )
  parser.add_argument(
    "--top", type=int, default=10,
    help="선정할 상위 종목 수 (기본값: 10)",
  )
  parser.add_argument(
    "--max-stocks", type=int, default=300,
    help="OHLCV 수집 최대 종목 수 (기본값: 300, 클수록 느림)",
  )
  return parser.parse_args()


# ─────────────────────────────────────────────────────────────────────────────
# 엔트리 포인트
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
  args = parse_args()
  run_pipeline(
    target_date=args.date,
    market=args.market,
    top_n=args.top,
    max_stocks=args.max_stocks,
  )
