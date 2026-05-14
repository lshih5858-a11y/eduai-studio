"""개입(Intervention) 모델 정의.

Human-in-the-loop 원칙에 따라 모든 개입은 교수/관리자 승인 후 전달됩니다.
"""
import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class InterventionType(str, enum.Enum):
    """개입 유형 열거형."""

    EMAIL_ALERT = "EMAIL_ALERT"          # 이메일 알림
    COUNSELING_REQUEST = "COUNSELING_REQUEST"  # 상담 요청
    PEER_SUPPORT = "PEER_SUPPORT"        # 동료 지원 연결
    RESOURCE_SHARE = "RESOURCE_SHARE"    # 학습 자료 제공
    PROFESSOR_MEETING = "PROFESSOR_MEETING"  # 교수 면담


class InterventionStatus(str, enum.Enum):
    """개입 상태 열거형."""

    PENDING_APPROVAL = "PENDING_APPROVAL"  # 승인 대기
    APPROVED = "APPROVED"                  # 승인됨
    REJECTED = "REJECTED"                  # 거부됨
    DELIVERED = "DELIVERED"                # 전달됨
    CANCELLED = "CANCELLED"                # 취소됨


class UrgencyLevel(str, enum.Enum):
    """긴급도 열거형."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Intervention(TimestampMixin, Base):
    """개입 테이블.

    학습자에 대한 개입 요청을 저장합니다.
    생성 시 PENDING_APPROVAL 상태이며, 교수/관리자 승인 후 전달됩니다.
    """

    __tablename__ = "interventions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    # 개입 대상 (가명 식별자)
    target_pseudo_student_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("users.pseudo_student_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="개입 대상 학습자의 가명 식별자",
    )
    # 개입 생성자 (가명 식별자)
    creator_pseudo_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="개입을 요청한 사용자의 가명 식별자",
    )
    # 개입 유형
    intervention_type: Mapped[InterventionType] = mapped_column(
        Enum(InterventionType),
        nullable=False,
    )
    # 상태
    status: Mapped[InterventionStatus] = mapped_column(
        Enum(InterventionStatus),
        nullable=False,
        default=InterventionStatus.PENDING_APPROVAL,
        comment="Human-in-the-loop: 기본값 PENDING_APPROVAL",
    )
    # 긴급도
    urgency_level: Mapped[UrgencyLevel] = mapped_column(
        Enum(UrgencyLevel),
        nullable=False,
        default=UrgencyLevel.MEDIUM,
    )
    # 개입 메시지
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="개입 내용 메시지",
    )
    # 위험 점수 참조 (개입 근거)
    risk_prediction_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("risk_predictions.id", ondelete="SET NULL"),
        nullable=True,
        comment="개입 근거가 된 위험 예측 ID",
    )
    # 전달 시각
    delivered_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # 관계 정의
    target_user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[target_pseudo_student_id],
        primaryjoin="Intervention.target_pseudo_student_id == User.pseudo_student_id",
        back_populates="interventions_received",
    )
    approval: Mapped[Optional["InterventionApproval"]] = relationship(
        "InterventionApproval",
        back_populates="intervention",
        uselist=False,
    )

    def __repr__(self) -> str:
        return f"<Intervention target={self.target_pseudo_student_id} status={self.status}>"


class InterventionApproval(TimestampMixin, Base):
    """개입 승인/거부 기록 테이블.

    Human-in-the-loop 승인 행위를 기록합니다.
    """

    __tablename__ = "intervention_approvals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    intervention_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("interventions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    # 승인/거부자 가명 식별자
    approver_pseudo_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="승인 또는 거부한 교수/관리자의 가명 식별자",
    )
    # 승인 여부
    approved: Mapped[bool] = mapped_column(
        nullable=False,
        comment="승인(True) 또는 거부(False)",
    )
    # 결정 사유
    note: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="승인/거부 사유",
    )
    # 결정 시각
    decided_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="승인/거부 결정 시각",
    )

    # 관계 정의
    intervention: Mapped["Intervention"] = relationship(
        "Intervention",
        back_populates="approval",
    )

    def __repr__(self) -> str:
        return f"<InterventionApproval intervention_id={self.intervention_id} approved={self.approved}>"
