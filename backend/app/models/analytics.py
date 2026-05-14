"""학습 분석 모델 정의.

학습자 분석 스냅샷, 위험 예측, 추천 데이터를 저장합니다.
SHAP 기반 설명 가능한 AI 결과를 포함합니다.
"""
import enum
import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class RiskLevel(str, enum.Enum):
    """위험 수준 열거형."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class LearnerAnalyticsSnapshot(TimestampMixin, Base):
    """학습자 분석 스냅샷 테이블.

    특정 시점의 학습자 활동 지표를 캡처합니다.
    """

    __tablename__ = "learner_analytics_snapshots"
    __table_args__ = (
        Index("ix_snapshot_pseudo_id_created", "pseudo_student_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    pseudo_student_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("users.pseudo_student_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    # 제출 지연 일수
    submission_delay_days: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
        comment="평균 과제 제출 지연 일수",
    )
    # 포럼 활동 수
    forum_activity_count: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
        comment="포럼 게시글/댓글 수",
    )
    # 퀴즈 평균 점수
    quiz_avg_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
        comment="퀴즈 평균 점수 (0~100)",
    )
    # 동영상 시청 비율
    video_completion_rate: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
        comment="강의 동영상 완료율 (0~1)",
    )
    # LMS 접속 일수
    lms_active_days: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
        comment="최근 30일 LMS 접속 일수",
    )
    # 스냅샷 시점
    snapshot_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="스냅샷 생성 시점",
    )

    def __repr__(self) -> str:
        return f"<LearnerAnalyticsSnapshot pseudo_id={self.pseudo_student_id}>"


class RiskPrediction(TimestampMixin, Base):
    """위험 예측 테이블.

    모델이 생성한 중도탈락 위험 예측 결과를 저장합니다.
    SHAP reason code를 JSONB 컬럼으로 저장합니다.
    """

    __tablename__ = "risk_predictions"
    __table_args__ = (
        Index("ix_risk_pseudo_id_created", "pseudo_student_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    pseudo_student_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("users.pseudo_student_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    # 위험 점수 (0~1)
    risk_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="중도탈락 위험 점수 (0~1)",
    )
    # 위험 수준
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel),
        nullable=False,
    )
    # SHAP reason codes (JSONB)
    reason_codes: Mapped[Any] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        comment="SHAP 기반 위험 요인 설명",
    )
    # Platt scaling 등 캘리브레이션 노트
    calibration_note: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="모델 캘리브레이션 설명",
    )
    # 모델 버전
    model_version: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="v1.0.0",
    )

    def __repr__(self) -> str:
        return f"<RiskPrediction pseudo_id={self.pseudo_student_id} score={self.risk_score}>"


class Recommendation(TimestampMixin, Base):
    """추천 테이블.

    학습자에 대한 AI 기반 추천을 저장합니다.
    모든 추천에 SHAP 기반 근거를 포함합니다.
    """

    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    pseudo_student_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("users.pseudo_student_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    # 추천 유형
    recommendation_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="추천 유형 (e.g., STUDY_MATERIAL, TUTORING, PEER_STUDY)",
    )
    # 추천 내용
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="추천 내용 텍스트",
    )
    # SHAP 근거
    shap_reason_codes: Mapped[Any] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        comment="SHAP 기반 추천 근거",
    )
    # 노출 여부
    is_delivered: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Recommendation pseudo_id={self.pseudo_student_id} type={self.recommendation_type}>"
