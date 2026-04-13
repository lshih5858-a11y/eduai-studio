"""
==============================================================================
[2단계] 종목 필터링 및 스코어링 모듈 (analysis/scorer.py) — v3
==============================================================================

■ 점수 구성 (100점 만점) — v3에서 원래 설계대로 복원
  ┌──────────────────────────────────────────────────────────────────────┐
  │ 지표               │ 배점 │ 산정 방식                                 │
  ├──────────────────────────────────────────────────────────────────────┤
  │ 저평가 PER          │ 20점 │ 전체 종목 하위 백분위 (낮을수록 고점수)    │
  │ 저평가 PBR          │ 20점 │ 전체 종목 하위 백분위 (낮을수록 고점수)   │
  │                    │      │ ※ PBR 없으면 ROE 역전 지표로 대체          │
  ├──────────────────────────────────────────────────────────────────────┤
  │ 수급 기관 순매수     │ 20점 │ 5일 누적 기관 순매수 상위 백분위          │
  │ 수급 외국인 순매수   │ 20점 │ 5일 누적 외국인 순매수 상위 백분위        │
  ├──────────────────────────────────────────────────────────────────────┤
  │ 기술 거래량 급증     │ 10점 │ 5일평균 / 20일평균 ≥ 1.5배 → 10점       │
  │ 기술 이동평균 정배열  │ 10점 │ 5MA > 20MA > 60MA → 10점               │
  └──────────────────────────────────────────────────────────────────────┘

  ※ v3에서는 기관·외국인 실제 순매수 데이터를 네이버 금융에서 수집
    (pykrx KRX API가 이 환경에서 차단되어 대체 소스 사용)

==============================================================================
"""

import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


# =============================================================================
# 유틸리티: 백분위 점수 변환
# =============================================================================

def percentile_score(series: pd.Series, higher_is_better: bool = False) -> pd.Series:
    """
    수치 시리즈를 0~100 백분위 점수로 변환한다.

    Parameters
    ----------
    series           : 점수화할 수치 시리즈 (NaN 포함 가능)
    higher_is_better : True  → 높은 값에 높은 점수 (수급, 모멘텀)
                       False → 낮은 값에 높은 점수 (PER, PBR)

    Returns
    -------
    pd.Series : 0~100 사이 백분위 점수 (NaN 종목은 0점)

    예시:
        [10, 20, 30] → higher_is_better=False → [100, 50, 0] (낮은 값이 높은 점수)
        [10, 20, 30] → higher_is_better=True  → [0,  50, 100]
    """
    rank = series.rank(method="average", na_option="bottom")
    n    = series.notna().sum()
    if n == 0:
        return pd.Series(0.0, index=series.index)

    pct = (rank / n) * 100
    if not higher_is_better:
        pct = 100 - pct  # 낮을수록 높은 점수로 반전

    return pct.clip(0, 100)


# =============================================================================
# [지표 1] 저평가 점수 — PER · PBR 기반 (40점 만점)
# =============================================================================

def calc_valuation_score(fund_df: pd.DataFrame, max_score: float = 40.0) -> pd.Series:
    """
    PER·PBR 기반 저평가 점수 계산 (최대 40점).

    산정 방식:
    - PER (20점): 전체 종목 중 낮은 PER일수록 고점수 (하위 백분위)
    - PBR (20점): 전체 종목 중 낮은 PBR일수록 고점수 (하위 백분위)
      * PBR 컬럼이 없거나 결측이 많으면 ROE 역수(1/ROE) 대체
      * PBR 있으면 낮을수록 저평가 = 좋은 것
      * ROE 대체 시 높은 ROE = 효율적 자산운용 = 좋은 것 (방향 반전)

    이상값 제거:
    - PER ≤ 0 (적자 기업) → 제외
    - PER > 200 (버블 수준) → 제외
    - PBR ≤ 0 → 제외
    - PBR > 20 (극단적 고PBR) → 제외

    Parameters
    ----------
    fund_df   : 기본지표 DataFrame (index=종목코드, columns=[PER, PBR, ROE, ...])
    max_score : 최대 배점 (기본 40점)

    Returns
    -------
    pd.Series : index=종목코드, values=0~40점
    """
    logger.info("📐 [지표1] 저평가 점수(Valuation) 계산 중...")

    if fund_df.empty:
        logger.warning("  ⚠️ 기본지표 데이터 없음 → 저평가 점수 전체 0점 처리")
        return pd.Series(dtype=float).rename("valuation_score")

    # 각 지표의 최대 배점 = max_score / 2 (20점)
    half = max_score / 2
    scale = half / 100  # 백분위(0~100) → 배점(0~20) 변환 인수

    # ── PER 처리 ──────────────────────────────────────────────────────────────
    if "PER" in fund_df.columns:
        per = fund_df["PER"].copy().astype(float)
        per[per <= 0]  = np.nan  # 적자 기업 제외
        per[per > 200] = np.nan  # 극단적 버블 제외
        per_valid_cnt  = per.notna().sum()
    else:
        logger.warning("  ⚠️ PER 컬럼 없음 → PER 점수 0점")
        per = pd.Series(np.nan, index=fund_df.index)
        per_valid_cnt = 0

    # ── PBR 처리 (없으면 ROE 역수 대체) ───────────────────────────────────────
    pbr_source = "없음"
    pbr_higher = False  # 낮을수록 저평가 (기본값)

    if "PBR" in fund_df.columns:
        pbr = fund_df["PBR"].copy().astype(float)
        pbr[pbr <= 0]  = np.nan
        pbr[pbr > 20]  = np.nan
        pbr_valid_cnt  = pbr.notna().sum()

        if pbr_valid_cnt >= 10:  # 유효 데이터 10개 이상이면 PBR 사용
            pbr_source = "PBR"
        else:
            # PBR 유효 데이터 부족 → ROE 대체
            if "ROE" in fund_df.columns:
                pbr = fund_df["ROE"].copy().astype(float)
                pbr[pbr <= 0] = np.nan
                pbr_source = "ROE(PBR대체)"
                pbr_higher = True  # ROE는 높을수록 우량
            else:
                pbr = pd.Series(np.nan, index=fund_df.index)
    elif "ROE" in fund_df.columns:
        # PBR 컬럼 자체 없음 → ROE 대체
        pbr = fund_df["ROE"].copy().astype(float)
        pbr[pbr <= 0] = np.nan
        pbr_source = "ROE(PBR대체)"
        pbr_higher = True
    else:
        pbr = pd.Series(np.nan, index=fund_df.index)

    logger.info(
        f"  PER 유효={per_valid_cnt}개 | "
        f"PBR 소스={pbr_source} 유효={pbr.notna().sum()}개"
    )

    # ── 백분위 점수화 → 배점으로 환산 ─────────────────────────────────────────
    per_score = percentile_score(per, higher_is_better=False) * scale
    pbr_score = percentile_score(pbr, higher_is_better=pbr_higher) * scale

    # ── 합산 ──────────────────────────────────────────────────────────────────
    combined_idx = per_score.index.union(pbr_score.index)
    val_score = (
        per_score.reindex(combined_idx).fillna(0.0)
        + pbr_score.reindex(combined_idx).fillna(0.0)
    )

    valid_cnt = (val_score > 0).sum()
    logger.info(
        f"  ✅ 저평가 점수 완료: 유효={valid_cnt}개 | "
        f"평균={val_score[val_score > 0].mean():.2f}점 | "
        f"최고={val_score.max():.2f}점"
    )
    return val_score.rename("valuation_score")


# =============================================================================
# [지표 2] 수급 점수 — 기관·외국인 순매수 기반 (40점 만점)
# =============================================================================

def calc_supply_demand_score(
    investor_df: pd.DataFrame,
    max_score: float = 40.0,
) -> pd.Series:
    """
    기관·외국인 5일 누적 순매수 기반 수급 점수 계산 (최대 40점).

    산정 방식:
    - 기관 5일 누적 순매수 (20점): 전체 종목 중 상위 백분위
    - 외국인 5일 누적 순매수 (20점): 전체 종목 중 상위 백분위

    Parameters
    ----------
    investor_df : 수급 DataFrame (index=종목코드, columns=[기관누적, 외국인누적])
    max_score   : 최대 배점 (기본 40점)

    Returns
    -------
    pd.Series : index=종목코드, values=0~40점
    """
    logger.info("💹 [지표2] 수급 점수(Supply-Demand) 계산 중...")

    if investor_df is None or investor_df.empty:
        logger.warning("  ⚠️ 수급 데이터 없음 → 수급 점수 전체 0점 처리")
        return pd.Series(dtype=float).rename("supply_demand_score")

    half  = max_score / 2
    scale = half / 100

    # ── 기관 순매수 ───────────────────────────────────────────────────────────
    if "기관누적" in investor_df.columns:
        inst = investor_df["기관누적"].copy().astype(float)
        inst_valid = inst.notna().sum()
    else:
        inst = pd.Series(np.nan, index=investor_df.index)
        inst_valid = 0

    # ── 외국인 순매수 ─────────────────────────────────────────────────────────
    if "외국인누적" in investor_df.columns:
        frgn = investor_df["외국인누적"].copy().astype(float)
        frgn_valid = frgn.notna().sum()
    else:
        frgn = pd.Series(np.nan, index=investor_df.index)
        frgn_valid = 0

    logger.info(f"  기관 유효={inst_valid}개 | 외국인 유효={frgn_valid}개")

    # ── 백분위 점수화 ─────────────────────────────────────────────────────────
    inst_score = percentile_score(inst, higher_is_better=True) * scale
    frgn_score = percentile_score(frgn, higher_is_better=True) * scale

    combined_idx = inst_score.index.union(frgn_score.index)
    sd_score = (
        inst_score.reindex(combined_idx).fillna(0.0)
        + frgn_score.reindex(combined_idx).fillna(0.0)
    )

    valid_cnt = (sd_score > 0).sum()
    logger.info(
        f"  ✅ 수급 점수 완료: 유효={valid_cnt}개 | "
        f"평균={sd_score[sd_score > 0].mean():.2f}점 | "
        f"최고={sd_score.max():.2f}점"
    )
    return sd_score.rename("supply_demand_score")


# =============================================================================
# [지표 3] 기술적 점수 — 거래량 급증 + 이동평균 정배열 (20점 만점)
# =============================================================================

def calc_technical_score(
    ohlcv_dict: dict,
    max_score: float = 20.0,
    vol_ratio_threshold: float = 1.5,
    ma_windows: tuple = (5, 20, 60),
) -> pd.Series:
    """
    거래량 급증(10점) + 이동평균 정배열(10점) 기술적 지표 (최대 20점).

    ① 거래량 급증 (10점)
       최근 5일 평균 거래량 ÷ 직전 5~25일 평균 거래량 ≥ vol_ratio_threshold
       → 단기 매수 세력 유입 신호

    ② 이동평균 정배열 (10점)
       5일 이동평균 > 20일 이동평균 > 60일 이동평균
       → 단기·중기·장기 상승 추세 확인

    Parameters
    ----------
    ohlcv_dict          : {종목코드: OHLCV DataFrame}
    max_score           : 최대 배점 (기본 20점)
    vol_ratio_threshold : 거래량 급증 기준 비율 (기본 1.5배)
    ma_windows          : 이동평균 기간 (5, 20, 60)

    Returns
    -------
    pd.Series : index=종목코드, values=0|10|20
    """
    logger.info("📊 [지표3] 기술적 점수(Technical) 계산 중...")

    if not ohlcv_dict:
        logger.warning("  ⚠️ OHLCV 데이터 없음 → 기술적 점수 전체 0점 처리")
        return pd.Series(dtype=float).rename("tech_score")

    ma5, ma20, ma60 = ma_windows
    half = max_score / 2  # 10점

    tech_scores: dict = {}
    vol_spike_cnt  = 0
    ma_aligned_cnt = 0

    for code, df in ohlcv_dict.items():
        score = 0.0

        # ── 컬럼 탐지 ─────────────────────────────────────────────────────────
        vol_col = next(
            (c for c in df.columns if "거래량" in c or c.lower() == "volume"), None
        )
        close_col = next(
            (c for c in df.columns if "종가" in c or c.lower() == "close"), None
        )

        # 데이터 부족 시 0점
        if vol_col is None or close_col is None or len(df) < ma60:
            tech_scores[code] = 0.0
            continue

        close  = df[close_col].astype(float)
        volume = df[vol_col].astype(float)

        # ── ① 거래량 급증 체크 ────────────────────────────────────────────────
        # 최근 5거래일 평균 vs 직전 5~25거래일 평균
        recent_vol   = volume.iloc[-5:].mean()      # 최근 5일
        baseline_vol = volume.iloc[-25:-5].mean()   # 직전 20일 (베이스라인)

        if baseline_vol > 0 and not np.isnan(baseline_vol):
            if (recent_vol / baseline_vol) >= vol_ratio_threshold:
                score += half   # +10점
                vol_spike_cnt += 1

        # ── ② 이동평균 정배열 체크 ───────────────────────────────────────────
        ma5_val  = close.rolling(window=ma5).mean().iloc[-1]
        ma20_val = close.rolling(window=ma20).mean().iloc[-1]
        ma60_val = close.rolling(window=ma60).mean().iloc[-1]

        if (
            pd.notna(ma5_val) and pd.notna(ma20_val) and pd.notna(ma60_val)
            and ma5_val > ma20_val > ma60_val
        ):
            score += half   # +10점
            ma_aligned_cnt += 1

        tech_scores[code] = score

    result = pd.Series(tech_scores).rename("tech_score")
    full_score_cnt = (result == max_score).sum()

    logger.info(
        f"  ✅ 기술적 점수 완료: {len(result)}개 종목 | "
        f"거래량 급증={vol_spike_cnt}개 | "
        f"MA 정배열={ma_aligned_cnt}개 | "
        f"만점({max_score:.0f}점)={full_score_cnt}개"
    )
    return result


# =============================================================================
# 통합 스코어링 — 최종 상위 N개 종목 선정
# =============================================================================

def combine_scores(
    stock_list_df: pd.DataFrame,
    val_score: pd.Series,
    sd_score: pd.Series,
    tech_score: pd.Series,
    fund_df: pd.DataFrame,
    investor_df: pd.DataFrame = None,
    top_n: int = 10,
) -> pd.DataFrame:
    """
    3가지 점수를 합산하여 상위 top_n 종목을 반환한다.

    총점 = 저평가(40점) + 수급(40점) + 기술(20점) = 100점 만점

    Parameters
    ----------
    stock_list_df : 종목 리스트 DataFrame (Code, Name, Market, 시가총액)
    val_score     : 저평가 점수 Series (index=종목코드)
    sd_score      : 수급 점수 Series (index=종목코드)
    tech_score    : 기술적 점수 Series (index=종목코드)
    fund_df       : 기본지표 DataFrame (PER, PBR, ROE 등)
    investor_df   : 수급 DataFrame (기관누적, 외국인누적)
    top_n         : 선정 종목 수

    Returns
    -------
    pd.DataFrame : 순위 포함 top_n 행
        columns=[순위, 종목코드, 종목명, Market, 시가총액, 저평가, 수급, 기술, 총점, PER, PBR, ROE, 외국인비율, 기관누적, 외국인누적]
    """
    logger.info(f"🏆 종합 점수 합산 → 상위 {top_n}개 종목 선정 중...")

    # ── 베이스 DataFrame 구성 ─────────────────────────────────────────────────
    base = stock_list_df.set_index("Code")[["Name", "Market", "시가총액"]].copy()

    # ── 각 점수 조인 ─────────────────────────────────────────────────────────
    base = base.join(val_score.rename("저평가"),   how="left")
    base = base.join(sd_score.rename("수급"),      how="left")
    base = base.join(tech_score.rename("기술"),    how="left")

    # NaN → 0점 처리
    base[["저평가", "수급", "기술"]] = base[["저평가", "수급", "기술"]].fillna(0.0)

    # ── 총점 계산 ─────────────────────────────────────────────────────────────
    base["총점"] = base["저평가"] + base["수급"] + base["기술"]

    # ── 기본지표 추가 (PER, PBR, ROE, 외국인비율) ────────────────────────────
    if fund_df is not None and not fund_df.empty:
        for col in ["PER", "PBR", "ROE", "외국인비율"]:
            if col in fund_df.columns:
                base = base.join(fund_df[[col]], how="left")

    # ── 수급 원시 데이터 추가 (기관누적, 외국인누적) ──────────────────────────
    if investor_df is not None and not investor_df.empty:
        for col in ["기관누적", "외국인누적"]:
            if col in investor_df.columns:
                base = base.join(investor_df[[col]], how="left")

    # ── 필터링: 총점 > 0 인 종목만 선정 ─────────────────────────────────────
    valid = base[base["총점"] > 0].copy()

    if valid.empty:
        # 비상 모드: 기술 점수라도 있는 종목 선정
        valid = base[base["기술"] > 0].copy()
        logger.warning("  ⚠️ 비상 모드: 기술점수 종목만으로 선정 (저평가·수급 모두 0)")

    # ── 상위 top_n 선정 ───────────────────────────────────────────────────────
    top_df = (
        valid
        .sort_values("총점", ascending=False)
        .head(top_n)
        .reset_index()
        .rename(columns={"Code": "종목코드", "Name": "종목명"})
    )
    top_df.insert(0, "순위", range(1, len(top_df) + 1))

    logger.info(f"✅ 최종 {len(top_df)}개 종목 선정 완료!")
    if not top_df.empty:
        logger.info(
            f"  1위: {top_df.iloc[0]['종목명']} "
            f"(총점={top_df.iloc[0]['총점']:.2f}, "
            f"저평가={top_df.iloc[0]['저평가']:.2f}, "
            f"수급={top_df.iloc[0]['수급']:.2f}, "
            f"기술={top_df.iloc[0]['기술']:.2f})"
        )
    return top_df
