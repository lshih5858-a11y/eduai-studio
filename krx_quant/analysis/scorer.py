"""
==============================================================================
[2단계] 종목 필터링 및 스코어링 모듈 (analysis/scorer.py)
==============================================================================

■ CoT 2단계: 종목 필터링 및 스코어링(점수화) 로직

  [지표 1] 저평가 지표 (Valuation Score) — 최대 40점
    - PER 하위 30% 이내 → 최대 20점 (낮을수록 고점수)
    - PBR 하위 30% 이내 → 최대 20점 (낮을수록 고점수)
    - PER ≤ 0 (적자) 또는 누락 시 0점 처리

  [지표 2] 성장·수급 지표 (Momentum Score) — 최대 40점
    - 최근 5거래일 기관 순매수 금액 → 최대 20점 (많을수록 고점수)
    - 최근 5거래일 외국인 순매수 금액 → 최대 20점 (많을수록 고점수)

  [지표 3] 변동성·기술 지표 (Technical Score) — 최대 20점
    - 거래량 급증(최근 5일 거래량 평균 / 20일 거래량 평균 > 1.5) → 10점
    - 이동평균선 정배열(5일MA > 20일MA > 60일MA) → 10점

  최종 점수 = Valuation + Momentum + Technical (100점 만점)

==============================================================================
"""

import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# 유틸리티: 백분위 기반 점수 변환
# ─────────────────────────────────────────────────────────────────────────────

def percentile_score(series: pd.Series, higher_is_better: bool = False) -> pd.Series:
  """
  시리즈 값을 0~100 백분위 점수로 변환한다.

  Parameters
  ----------
  series          : 점수화할 수치 시리즈
  higher_is_better: True → 높을수록 고점수 / False → 낮을수록 고점수

  Returns
  -------
  pd.Series  (0.0 ~ 100.0)
  """
  # 결측값 제거 후 순위 계산
  rank = series.rank(method="average", na_option="bottom")
  n = series.notna().sum()
  if n == 0:
    return pd.Series(0.0, index=series.index)

  pct = (rank / n) * 100  # 1% ~ 100%

  if not higher_is_better:
    pct = 100 - pct  # 낮을수록 좋으면 역전

  return pct.clip(0, 100)


# ─────────────────────────────────────────────────────────────────────────────
# [지표 1] 저평가 점수 계산
# ─────────────────────────────────────────────────────────────────────────────

def calc_valuation_score(fund_df: pd.DataFrame, max_score: float = 40.0) -> pd.Series:
  """
  PER·PBR 기반 저평가 점수를 계산한다.

  Parameters
  ----------
  fund_df   : fetch_fundamental_data() 의 반환 DataFrame
  max_score : 최대 배점 (기본 40점)

  Returns
  -------
  pd.Series  index=종목코드, values=저평가점수(0~max_score)
  """
  logger.info("📐 [지표1] 저평가 점수(Valuation) 계산 중...")
  df = fund_df.copy()

  # ── PER 처리 ────────────────────────────────────────────────────────────
  # PER ≤ 0 이거나 매우 크면 신뢰도 낮음 → NaN 처리
  per = df["PER"].copy() if "PER" in df.columns else pd.Series(dtype=float)
  per = per.replace(0, np.nan)
  per[per < 0] = np.nan        # 적자 기업
  per[per > 200] = np.nan      # 극단적 고PER 제외 (200배 초과)

  # ── PBR 처리 ────────────────────────────────────────────────────────────
  pbr = df["PBR"].copy() if "PBR" in df.columns else pd.Series(dtype=float)
  pbr = pbr.replace(0, np.nan)
  pbr[pbr < 0] = np.nan
  pbr[pbr > 20] = np.nan       # 극단적 고PBR 제외

  # ── 백분위 점수화 (낮을수록 저평가 → 고점수) ───────────────────────────
  per_score = percentile_score(per, higher_is_better=False) * (max_score / 2 / 100)
  pbr_score = percentile_score(pbr, higher_is_better=False) * (max_score / 2 / 100)

  # 공통 인덱스로 정렬 후 합산
  combined_index = per_score.index.union(pbr_score.index)
  val_score = (
    per_score.reindex(combined_index).fillna(0)
    + pbr_score.reindex(combined_index).fillna(0)
  )

  logger.info(f"  ✅ 저평가 점수 계산 완료: {val_score.notna().sum()}개 종목")
  return val_score.rename("valuation_score")


# ─────────────────────────────────────────────────────────────────────────────
# [지표 2] 기관/외국인 수급 점수 계산
# ─────────────────────────────────────────────────────────────────────────────

def calc_momentum_score(
  investor_data: dict[str, pd.DataFrame],
  max_score: float = 40.0,
) -> pd.Series:
  """
  기관·외국인 5일 순매수 합계를 기반으로 수급 점수를 계산한다.

  Parameters
  ----------
  investor_data : fetch_investor_trading() 의 반환 딕셔너리
  max_score     : 최대 배점 (기본 40점)

  Returns
  -------
  pd.Series  index=종목코드, values=수급점수(0~max_score)
  """
  logger.info("💹 [지표2] 수급 점수(Momentum) 계산 중...")

  frames = []
  for market, df in investor_data.items():
    if df.empty:
      continue
    frames.append(df)

  if not frames:
    logger.warning("⚠️ 수급 데이터 없음 → 수급 점수 전부 0점 처리")
    return pd.Series(dtype=float).rename("momentum_score")

  # KOSPI + KOSDAQ 합산
  merged = pd.concat(frames)
  # 중복 종목코드는 합산 (KOSPI·KOSDAQ 동시 상장 방지)
  merged = merged.groupby(merged.index).sum()

  col_names = merged.columns.tolist()

  # 기관합계 컬럼 찾기
  inst_col = next((c for c in col_names if "기관" in c), None)
  # 외국인합계 컬럼 찾기
  fore_col = next((c for c in col_names if "외국인" in c), None)

  if inst_col is None or fore_col is None:
    logger.warning(f"⚠️ 수급 컬럼 탐지 실패 (사용 가능한 컬럼: {col_names[:4]})")
    return pd.Series(dtype=float).rename("momentum_score")

  inst = merged[inst_col].copy()
  fore = merged[fore_col].copy()

  # 백분위 점수화 (높을수록 순매수 강함 → 고점수)
  inst_score = percentile_score(inst, higher_is_better=True) * (max_score / 2 / 100)
  fore_score = percentile_score(fore, higher_is_better=True) * (max_score / 2 / 100)

  momentum_score = inst_score.add(fore_score, fill_value=0)

  logger.info(f"  ✅ 수급 점수 계산 완료: {momentum_score.notna().sum()}개 종목")
  return momentum_score.rename("momentum_score")


# ─────────────────────────────────────────────────────────────────────────────
# [지표 3] 거래량·이동평균 기술 점수 계산
# ─────────────────────────────────────────────────────────────────────────────

def calc_technical_score(
  ohlcv_dict: dict[str, pd.DataFrame],
  max_score: float = 20.0,
  vol_ratio_threshold: float = 1.5,
  ma_windows: tuple = (5, 20, 60),
) -> pd.Series:
  """
  거래량 급증 + 이동평균 정배열 여부를 기반으로 기술적 점수를 계산한다.

  Parameters
  ----------
  ohlcv_dict          : {종목코드: OHLCV DataFrame} 딕셔너리
  max_score           : 최대 배점 (기본 20점)
  vol_ratio_threshold : 거래량 급증 기준 (5일평균/20일평균 비율)
  ma_windows          : 이동평균선 기간 (5, 20, 60)

  Returns
  -------
  pd.Series  index=종목코드, values=기술점수(0~max_score)
  """
  logger.info("📊 [지표3] 기술적 점수(Technical) 계산 중...")
  ma5, ma20, ma60 = ma_windows
  tech_scores = {}

  for code, df in ohlcv_dict.items():
    score = 0.0

    # 거래량 컬럼 탐지 ('거래량' 또는 'Volume')
    vol_col = None
    for c in df.columns:
      if "거래량" in c or c.lower() == "volume":
        vol_col = c
        break

    # 종가 컬럼 탐지 ('종가' 또는 'Close')
    close_col = None
    for c in df.columns:
      if "종가" in c or c.lower() == "close":
        close_col = c
        break

    if vol_col is None or close_col is None or len(df) < ma60:
      # 데이터 부족 시 0점
      tech_scores[code] = 0.0
      continue

    close  = df[close_col].astype(float)
    volume = df[vol_col].astype(float)

    # ── 거래량 급증 체크 ───────────────────────────────────────────────
    # 최근 5거래일 평균 vs 직전 20거래일 평균 비율
    recent_vol  = volume.iloc[-5:].mean()
    baseline_vol = volume.iloc[-25:-5].mean()  # 5~25일 전 평균

    if baseline_vol > 0 and (recent_vol / baseline_vol) >= vol_ratio_threshold:
      score += max_score / 2  # 10점 (20점 기준)

    # ── 이동평균 정배열 체크 ───────────────────────────────────────────
    # 5일MA > 20일MA > 60일MA 이면 정배열(상승 추세)
    ma5_val  = close.rolling(ma5).mean().iloc[-1]
    ma20_val = close.rolling(ma20).mean().iloc[-1]
    ma60_val = close.rolling(ma60).mean().iloc[-1]

    if (
      pd.notna(ma5_val) and pd.notna(ma20_val) and pd.notna(ma60_val)
      and ma5_val > ma20_val > ma60_val
    ):
      score += max_score / 2  # 10점

    tech_scores[code] = score

  result = pd.Series(tech_scores).rename("tech_score")
  logger.info(f"  ✅ 기술적 점수 계산 완료: {len(result)}개 종목")
  return result


# ─────────────────────────────────────────────────────────────────────────────
# 통합 스코어링
# ─────────────────────────────────────────────────────────────────────────────

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
  3가지 점수를 합산하여 최종 순위 DataFrame을 반환한다.

  Parameters
  ----------
  stock_list_df : fetch_stock_list() 의 DataFrame (Code, Name, Market)
  val_score     : 저평가 점수 Series
  mom_score     : 수급 점수 Series
  tech_score    : 기술적 점수 Series
  fund_df       : 기본지표 DataFrame (PER, PBR 포함)
  market_cap_df : 시가총액 DataFrame
  top_n         : 상위 N개 종목

  Returns
  -------
  pd.DataFrame
    상위 top_n 개 종목의 종합 점수 및 세부 지표
  """
  logger.info(f"🏆 종합 점수 합산 및 상위 {top_n}개 종목 선정 중...")

  # 종목코드를 인덱스로 설정
  base = stock_list_df.set_index("Code")[["Name", "Market"]].copy()

  # 각 점수 병합
  base = base.join(val_score,  how="left")
  base = base.join(mom_score,  how="left")
  base = base.join(tech_score, how="left")

  # 결측값 0점 처리
  base["valuation_score"] = base["valuation_score"].fillna(0)
  base["momentum_score"]  = base["momentum_score"].fillna(0)
  base["tech_score"]      = base["tech_score"].fillna(0)

  # ── 총점 계산 ────────────────────────────────────────────────────────
  base["total_score"] = (
    base["valuation_score"]
    + base["momentum_score"]
    + base["tech_score"]
  )

  # ── 기본지표(PER, PBR) 추가 ──────────────────────────────────────────
  if not fund_df.empty:
    for col in ["PER", "PBR", "EPS", "BPS"]:
      if col in fund_df.columns:
        base = base.join(fund_df[[col]], how="left")

  # ── 시가총액 추가 ────────────────────────────────────────────────────
  if not market_cap_df.empty:
    cap_col = next((c for c in market_cap_df.columns if "시가총액" in c), None)
    if cap_col:
      base = base.join(market_cap_df[[cap_col]], how="left")
      base.rename(columns={cap_col: "시가총액"}, inplace=True)

  # ── 최소 유효성 필터 ─────────────────────────────────────────────────
  # tech_score > 0 또는 total_score > 0 인 종목만 선정 대상
  valid_mask = base["total_score"] > 0
  scored_df = base[valid_mask].copy()

  # 총점 내림차순 정렬
  scored_df = scored_df.sort_values("total_score", ascending=False)

  # 상위 top_n 개 선정
  top_df = scored_df.head(top_n).reset_index()
  top_df.insert(0, "순위", range(1, len(top_df) + 1))
  top_df.rename(columns={"Code": "종목코드", "Name": "종목명"}, inplace=True)

  logger.info(f"✅ 상위 {top_n}개 종목 선정 완료!")
  return top_df
