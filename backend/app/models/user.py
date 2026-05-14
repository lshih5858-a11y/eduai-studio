"""사용자 모델 정의.

Privacy-by-default 원칙에 따라 PII(개인식별정보)를 분리 저장합니다.
- users 테이블: 가명 식별자(pseudo_student_id), 역할, 표시 이름만 보관
- user_identity_map 테이블: 실제 student_id <-> pseudo_student_id 매핑 (pii 스키마)
"""
import enum
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    """사용자 역할 열거형."""

    STUDENT = "STUDENT"
    PROFESSOR = "PROFESSOR"
    ASSISTANT = "ASSISTANT"
    ADMIN = "ADMIN"
    RESEARCHER = "RESEARCHER"


class User(TimestampMixin, Base):
    """사용자 테이블.

    PII를 포함하지 않습니다. pseudo_student_id로만 식별합니다.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    # 가명 식별자 (분석에 사용)
    pseudo_student_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
        comment="실제 학번을 해시한 가명 식별자",
    )
    # 역할
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.STUDENT,
    )
    # 표시 이름 (실명 아님, 예: "학생_A1234")
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="표시용 이름 (실명 아님)",
    )
    # 소속 기관 코드
    institution_code: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="소속 대학 코드",
    )
    # 계정 활성화 여부
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    # 마지막 로그인 시각
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # 관계 정의
    consent_records: Mapped[List["ConsentRecord"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "ConsentRecord",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    enrollments: Mapped[List["Enrollment"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Enrollment",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    interventions_received: Mapped[List["Intervention"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Intervention",
        foreign_keys="[Intervention.target_pseudo_student_id]",
        primaryjoin="User.pseudo_student_id == Intervention.target_pseudo_student_id",
        back_populates="target_user",
    )

    def __repr__(self) -> str:
        return f"<User pseudo_id={self.pseudo_student_id} role={self.role}>"


class UserIdentityMap(TimestampMixin, Base):
    """PII 분리 테이블: 실제 학번 <-> 가명 식별자 매핑.

    이 테이블은 별도 'pii' 스키마에 저장됩니다.
    접근은 엄격히 감사됩니다.
    """

    __tablename__ = "user_identity_map"
    __table_args__ = (
        UniqueConstraint("student_id", name="uq_student_id"),
        UniqueConstraint("pseudo_student_id", name="uq_pseudo_student_id_pii"),
        {"schema": "pii", "comment": "PII 분리 저장 테이블 - 접근 시 반드시 감사 로그 기록"},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    # 실제 학번 (PII)
    student_id: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="실제 학번 (PII) - 접근 시 감사 필요",
    )
    # 가명 식별자
    pseudo_student_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        comment="분석용 가명 식별자",
    )
    # 매핑 생성자 (관리자 ID)
    created_by: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="매핑 생성한 관리자의 pseudo_student_id",
    )

    def __repr__(self) -> str:
        return f"<UserIdentityMap pseudo_id={self.pseudo_student_id}>"
