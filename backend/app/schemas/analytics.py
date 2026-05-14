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


class LearnerSnapshotRead(BaseModel):
    """학습자 분석 스냅샷 응답 스키마."""

    pseudo_student_id: str
    course_id: UUID
    submission_delay_days: float
    forum_activity_count: int
    quiz_avg_score: float
    video_completion_rate: float
    lms_active_days: int
    risk_prediction: Optional[RiskRead] = Field(None, description="최신 위험 예측")
    snapshot_date: datetime


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
