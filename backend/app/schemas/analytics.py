"""학습 분석 관련 Pydantic 스키마."""
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.analytics import RiskLevel


class ShapReasonCode(BaseModel):
    """SHAP reason code 스키마."""

    feature: str = Field(..., description="피처 이름")
    shap_value: float = Field(..., description="SHAP 값 (절댓값 클수록 중요도 높음)")
    direction: str = Field(..., description="위험 방향: increases_risk 또는 decreases_risk")


class RiskRead(BaseModel):
    """위험 예측 조회 응답 스키마."""

    pseudo_student_id: str
    risk_score: float = Field(..., ge=0.0, le=1.0, description="위험 점수 (0~1)")
    risk_level: RiskLevel
    reason_codes: list[ShapReasonCode] = Field(
        ..., description="SHAP 기반 위험 요인 설명 목록"
    )
    calibration_note: Optional[str] = Field(None, description="모델 캘리브레이션 노트")
    model_version: str
    computed_at: datetime


class LearningPoint(BaseModel):
    """학습 진도 추이 데이터 포인트."""

    week: str = Field(..., description="주차 레이블 (예: '1주차')")
    score: float = Field(..., ge=0.0, le=100.0, description="해당 주 점수")
    cohort_avg: float = Field(..., ge=0.0, le=100.0, description="코호트 평균 점수")


class RecommendationItem(BaseModel):
    """AI 권장 개입 항목."""

    type: str = Field(..., description="개입 유형 (예: 상담, 보충자료)")
    message: str = Field(..., description="권장 개입 내용")
    confidence: float = Field(..., ge=0.0, le=1.0, description="추천 신뢰도")


class LearnerSnapshotRead(BaseModel):
    """학습자 분석 스냅샷 응답 스키마.

    개별 학습자 상세 페이지에서 사용합니다.
    """

    pseudo_student_id: str
    course_id: UUID
    submission_delay_days: float
    forum_activity_count: int
    quiz_avg_score: float
    video_completion_rate: float
    lms_active_days: int
    risk_prediction: Optional[RiskRead] = Field(None, description="최신 위험 예측")
    snapshot_date: datetime
    # 프론트엔드 학습자 상세 페이지용 추가 필드
    risk_score: float = Field(0.0, description="위험 점수 (편의 필드)")
    risk_level: RiskLevel = Field(RiskLevel.LOW, description="위험 수준 (편의 필드)")
    reason_codes: list[ShapReasonCode] = Field(default_factory=list)
    calibration_note: str = Field("", description="캘리브레이션 노트")
    model_version: str = Field("v1.0.0", description="모델 버전")
    computed_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    learning_curve: list[LearningPoint] = Field(default_factory=list, description="주차별 학습 진도")
    recommendations: list[RecommendationItem] = Field(default_factory=list, description="AI 권장 개입")


class LearnerRiskRead(BaseModel):
    """코호트 목록용 학습자 위험도 요약 스키마."""

    pseudo_student_id: str
    risk_score: float = Field(..., ge=0.0, le=1.0)
    risk_level: RiskLevel


class RecommendationRead(BaseModel):
    """추천 조회 응답 스키마."""

    id: UUID
    pseudo_student_id: str
    course_id: UUID
    recommendation_type: str
    content: str
    shap_reason_codes: list[ShapReasonCode]
    is_delivered: bool
    created_at: datetime


class RiskDistribution(BaseModel):
    """위험 수준 분포 통계."""

    low_count: int
    medium_count: int
    high_count: int
    total_count: int


class CohortStatsRead(BaseModel):
    """코호트 분석 통계 응답 스키마."""

    course_id: UUID
    total_students: int
    avg_risk_score: float
    risk_distribution: RiskDistribution
    avg_quiz_score: float
    avg_forum_activity: float
    avg_video_completion: float
    computed_at: datetime


class DashboardStatsRead(BaseModel):
    """대시보드 요약 통계 응답 스키마."""

    total_learners: int = Field(..., description="전체 학습자 수")
    high_risk_count: int = Field(..., description="고위험 학습자 수")
    pending_interventions: int = Field(..., description="승인 대기 개입 수")
    avg_completion_rate: float = Field(..., ge=0.0, le=1.0, description="평균 완료율")

