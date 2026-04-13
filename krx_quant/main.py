"""
==============================================================================
KRX 퀀트 투자 스코어링 시스템 — 메인 실행 파일 (main.py) — v3
==============================================================================

■ CoT 설계 요약 (단계적 사고)
  1단계: 데이터 수집 및 전처리
    - 종목 리스트  : FinanceDataReader StockListing ✅
    - PER·ROE     : 네이버 금융 sise_market_sum 스크래핑 ✅
    - PBR         : 네이버 금융 개별 종목 em#_pbr 스크래핑 ✅
    - 기관 순매수  : 네이버 금융 frgn.naver 개별 종목 Table ✅
    - 외국인 순매수: 네이버 금융 frgn.naver 개별 종목 Table ✅
    - OHLCV (60일): pykrx get_market_ohlcv ✅ (정상 작동)

  2단계: 종목 필터링 및 스코어링 (100점 만점)
    - 저평가 PER 20점 + PBR 20점 = 40점
    - 수급 기관 20점 + 외국인 20점 = 40점
    - 기술 거래량급증 10점 + MA정배열 10점 = 20점

  3단계: 최종 상위 10개 출력
    - 콘솔 컬러 테이블 출력
    - CSV / JSON / TXT 파일 저장

■ 사용 방법
    python main.py                     기본 실행 (최근 거래일 자동 탐지)
    python main.py --date 20240315     특정 날짜 지정
    python main.py --market KOSPI      KOSPI만 분석
    python main.py --top 20            상위 20개 종목 선정
    python main.py --max-stocks 200    최대 200개 종목 OHLCV 수집
    python main.py --fast              빠른 모드 (PBR·수급 수집 생략)

■ pip 설치 (처음 실행 전 한 번만)
    pip install finance-datareader pykrx pandas numpy flask tabulate colorama requests beautifulsoup4

==============================================================================
"""

# ── 표준 라이브러리 ──────────────────────────────────────────────────────────
import sys
import os
import argparse
import logging
import traceback
from datetime import datetime, timedelta

import pandas as pd

# ── 프로젝트 루트 경로 추가 ────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── 프로젝트 내부 모듈 import ────────────────────────────────────────────────
from krx_quant.data.collector import (
    get_last_trading_date,
    n_trading_days_before,
    fetch_stock_list,
    fetch_fundamental_data,
    fetch_investor_trading,
    fetch_ohlcv_bulk,
)
from krx_quant.analysis.scorer import (
    calc_valuation_score,
    calc_supply_demand_score,
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


# =============================================================================
# 예외 처리 래퍼
# =============================================================================

def handle_exception(error: Exception, context: str = "") -> None:
    """
    사용자에게 친화적인 오류 메시지를 출력하는 공통 예외 처리 함수.

    공휴일·비거래일, 네트워크 오류 등을 감지하여 맞춤형 안내를 제공한다.

    Parameters
    ----------
    error   : 발생한 예외 객체
    context : 어떤 단계에서 오류가 발생했는지 설명
    """
    try:
        from colorama import Fore, Style, init as colorama_init
        colorama_init(autoreset=True)
        red    = Fore.RED
        yellow = Fore.YELLOW
        reset  = Style.RESET_ALL
    except ImportError:
        red = yellow = reset = ""

    print()
    print(red + "━" * 62)
    print(red + f"  ❌ 오류 발생: {context}")
    print(red + f"  └─ {type(error).__name__}: {error}")

    err_str = str(error).lower()

    # 공휴일·비거래일 감지
    if any(kw in err_str for kw in ["비어", "empty", "none", "비거래", "holiday"]):
        three_days_ago = (datetime.today() - timedelta(days=3)).strftime("%Y%m%d")
        print(yellow + "")
        print(yellow + "  📅 오늘은 장이 열리지 않는 날(공휴일·주말)이거나")
        print(yellow + "     당일 데이터가 아직 확정되지 않았을 수 있습니다.")
        print(yellow + f"     직전 거래일을 직접 지정해 보세요:")
        print(yellow + f"     예시: python main.py --date {three_days_ago}")

    # 네트워크 오류 감지
    if any(kw in err_str for kw in ["connection", "timeout", "network", "http", "ssl"]):
        print(yellow + "")
        print(yellow + "  🌐 네트워크 연결 문제 또는 데이터 서버 일시 오류입니다.")
        print(yellow + "     잠시 후 다시 시도해 주세요.")

    print(red + "━" * 62)
    print()
    logger.debug(traceback.format_exc())


# =============================================================================
# 메인 파이프라인
# =============================================================================

def run_pipeline(
    target_date: str = None,
    market: str = "ALL",
    top_n: int = 10,
    max_stocks: int = 300,
    fast_mode: bool = False,
) -> None:
    """
    데이터 수집 → 스코어링 → 출력까지 전체 파이프라인을 실행한다.

    Parameters
    ----------
    target_date : 분석 기준일 (YYYYMMDD). None 이면 최근 거래일 자동 탐지.
    market      : 분석 시장 ("KOSPI" | "KOSDAQ" | "ALL")
    top_n       : 출력할 상위 종목 수
    max_stocks  : OHLCV 수집 최대 종목 수 (크면 시간↑)
    fast_mode   : True이면 PBR·수급 수집 생략 (빠른 테스트용)
    """
    try:
        from colorama import Fore, Style, init as colorama_init
        colorama_init(autoreset=True)
        cyan  = Fore.CYAN
        white = Fore.WHITE
        green = Fore.GREEN
        yellow = Fore.YELLOW
    except ImportError:
        cyan = white = green = yellow = ""

    print()
    print(cyan + "═" * 62)
    print(cyan + "  🚀 KRX 퀀트 투자 스코어링 시스템 v3 시작")
    print(cyan + f"  ⏱  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(cyan + f"  🎯  시장={market} | 상위={top_n}개 | 최대종목={max_stocks}개")
    if fast_mode:
        print(yellow + "  ⚡ 빠른 모드: PBR·수급 수집 생략")
    print(cyan + "═" * 62)

    # ─────────────────────────────────────────────────────────────────────────
    # [1/6] 최근 거래일 확인
    # ─────────────────────────────────────────────────────────────────────────
    print(white + "\n  [1/6] 최근 거래일 확인 중...")
    try:
        if target_date:
            trading_date = target_date
            logger.info(f"📅 사용자 지정 기준일: {trading_date}")
        else:
            trading_date = get_last_trading_date()
    except Exception as e:
        handle_exception(e, "거래일 확인")
        sys.exit(1)

    # 이동평균(60일) 계산을 위해 70거래일 전 시작일 (여유분 포함)
    start_date_60d = n_trading_days_before(trading_date, 70)
    logger.info(f"기준일: {trading_date} | OHLCV 시작: {start_date_60d}")

    # ─────────────────────────────────────────────────────────────────────────
    # [2/6] 전체 종목 리스트 수집
    # ─────────────────────────────────────────────────────────────────────────
    print(white + "\n  [2/6] 전체 종목 리스트 수집 중...")
    try:
        stock_list = fetch_stock_list(market=market)
        # 시가총액 기준 내림차순 정렬 (수급·PBR 수집 우선순위에 사용)
        stock_list = stock_list.sort_values("시가총액", ascending=False).reset_index(drop=True)
        code_list  = stock_list["Code"].tolist()
    except Exception as e:
        handle_exception(e, "종목 리스트 수집")
        sys.exit(1)

    # ─────────────────────────────────────────────────────────────────────────
    # [3/6] 기본지표 수집 (PER · PBR · ROE · 외국인비율)
    # ─────────────────────────────────────────────────────────────────────────
    print(white + "\n  [3/6] 기본지표(PER·PBR·ROE) 수집 중...")
    try:
        # fast_mode: PBR 개별 수집 생략 (시간 단축)
        fund_df = fetch_fundamental_data(
            stock_codes=code_list,
            max_pages=60,
            fetch_pbr=(not fast_mode),
            max_pbr_codes=300 if not fast_mode else 0,
        )
    except Exception as e:
        handle_exception(e, "기본지표(PER/PBR) 수집")
        logger.warning("⚠️ 기본지표 없이 계속 진행 (저평가 점수 = 0)")
        fund_df = pd.DataFrame()

    # ─────────────────────────────────────────────────────────────────────────
    # [4/6] 기관·외국인 순매수 수집 (최근 5거래일)
    # ─────────────────────────────────────────────────────────────────────────
    print(white + "\n  [4/6] 기관·외국인 순매수 수집 중 (최근 5일)...")
    investor_df = pd.DataFrame()
    if not fast_mode:
        try:
            investor_df = fetch_investor_trading(
                codes=code_list,
                days=5,
                max_codes=max_stocks,
            )
        except Exception as e:
            handle_exception(e, "기관·외국인 순매수 수집")
            logger.warning("⚠️ 수급 데이터 없이 계속 진행 (수급 점수 = 0)")
            investor_df = pd.DataFrame()
    else:
        logger.info("  ⚡ 빠른 모드: 수급 데이터 수집 생략")

    # ─────────────────────────────────────────────────────────────────────────
    # [5/6] OHLCV 수집 (이동평균 · 거래량)
    # ─────────────────────────────────────────────────────────────────────────
    print(white + f"\n  [5/6] OHLCV 수집 중 (최대 {max_stocks}개 종목)...")
    try:
        ohlcv_dict = fetch_ohlcv_bulk(
            codes=code_list,
            start_date=start_date_60d,
            end_date=trading_date,
            max_codes=max_stocks,
        )
    except Exception as e:
        handle_exception(e, "OHLCV 데이터 수집")
        logger.warning("⚠️ OHLCV 없이 계속 진행 (기술적 점수 = 0)")
        ohlcv_dict = {}

    # ─────────────────────────────────────────────────────────────────────────
    # [6/6] 스코어링 + 출력
    # ─────────────────────────────────────────────────────────────────────────
    print(white + "\n  [6/6] 스코어링(점수화) 진행 중...")

    # 저평가 점수 (40점)
    val_score = (
        calc_valuation_score(fund_df)
        if not fund_df.empty
        else pd.Series(dtype=float).rename("valuation_score")
    )

    # 수급 점수 (40점)
    sd_score = (
        calc_supply_demand_score(investor_df)
        if not investor_df.empty
        else pd.Series(dtype=float).rename("supply_demand_score")
    )

    # 기술적 점수 (20점)
    tech_score = (
        calc_technical_score(ohlcv_dict)
        if ohlcv_dict
        else pd.Series(dtype=float).rename("tech_score")
    )

    # ── 종합 점수 합산 및 상위 top_n 선정 ────────────────────────────────────
    try:
        top_df = combine_scores(
            stock_list_df=stock_list,
            val_score=val_score,
            sd_score=sd_score,
            tech_score=tech_score,
            fund_df=fund_df,
            investor_df=investor_df,
            top_n=top_n,
        )
    except Exception as e:
        handle_exception(e, "종합 점수 계산")
        sys.exit(1)

    if top_df.empty:
        print(yellow + "\n  ⚠️ 조건에 맞는 종목이 없습니다.")
        print(yellow + "     데이터 수집 범위 확대 또는 기준일 변경을 권장합니다.")
        sys.exit(0)

    # ── 결과 출력 ─────────────────────────────────────────────────────────────
    print_console_report(top_df, trading_date)

    # ── 파일 저장 ─────────────────────────────────────────────────────────────
    csv_path  = save_csv(top_df, trading_date)
    json_path = save_json(top_df, trading_date)
    txt_path  = save_text_report(top_df, trading_date)

    print(green + f"\n  ✅ 분석 완료!")
    print(green + f"  📁 CSV   : {csv_path}")
    print(green + f"  📁 JSON  : {json_path}")
    print(green + f"  📁 리포트: {txt_path}")
    print()


# =============================================================================
# CLI 인자 파싱
# =============================================================================

def parse_args():
    """커맨드라인 인자를 파싱한다."""
    parser = argparse.ArgumentParser(
        description="KRX 퀀트 투자 스코어링 시스템 v3 — KOSPI·KOSDAQ 투자 유망 종목 선정",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  python main.py                        기본 실행 (최근 거래일 자동 탐지)
  python main.py --date 20240315        특정 날짜 지정
  python main.py --market KOSPI         KOSPI만 분석
  python main.py --top 20               상위 20개 종목 선정
  python main.py --max-stocks 500       최대 500개 종목 OHLCV 수집
  python main.py --fast                 빠른 모드 (PBR·수급 수집 생략)
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
    parser.add_argument(
        "--fast", action="store_true", default=False,
        help="빠른 모드: PBR·수급 수집 생략 (테스트용)",
    )
    return parser.parse_args()


# =============================================================================
# 엔트리 포인트
# =============================================================================

if __name__ == "__main__":
    args = parse_args()
    run_pipeline(
        target_date=args.date,
        market=args.market,
        top_n=args.top,
        max_stocks=args.max_stocks,
        fast_mode=args.fast,
    )
