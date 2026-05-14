"""동의 관리 모델 정의.

4종 동의를 분리하여 관리합니다:
- SERVICE_USE: 서비스 이용 동의
- RESEARCH_PARTICIPATION: 연구 참여 동의
- THIRD_PARTY_SHARING: 제3자 제공 동의
- AI_LOG_RESEARCH: AI 학습 로그 연구 활용 동의

실제 student_id를 저장하지 않고 pseudo_student_id만 사용합니다.
"""
import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class ConsentTypeEnum(str, enum.Enum):
    """동의 유형 열거형."""

    SERVICE_USE = "SERVICE_USE"
    RESEARCH_PARTICIPATION = "RESEARCH_PARTICIPATION"
    THIRD_PARTY_SHARING = "THIRD_PARTY_SHARING"
    AI_LOG_RESEARCH = "AI_LOG_RESEARCH"


class ConsentType(Base):
    """동의 유형 정보 테이블."""

    __tablename__ = "consent_types"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    type_code: Mapped[ConsentTypeEnum] = mapped_column(
        Enum(ConsentTypeEnum),
        unique=True,
        nullable=False,
    )
    title_ko: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        comment="동의 유형 한국어 제목",
    )
    description_ko: Mapped[str] = mapped_column(
        String(2000),
        nullable=False,
        comment="동의 내용 설명 (한국어)",
    )
    is_required: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="필수 동의 여부",
    )
    current_version: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="1.0",
        comment="현재 동의서 버전",
    )

    # 관계 정의
    consent_records: Mapped[list["ConsentRecord"]] = relationship(
        "ConsentRecord",
        back_populates="consent_type_obj",
    )

    def __repr__(self) -> str:
        return f"<ConsentType code={self.type_code}>"


class ConsentRecord(TimestampMixin, Base):
    """동의 기록 테이블.

    동의/철회 이력을 모두 보관합니다 (append-only 원칙 준수).
    실제 학번(student_id) 대신 pseudo_student_id만 저장합니다.
    """

    __tablename__ = "consent_records"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    # PII 없음 - 가명 식별자만 사용
    pseudo_student_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("users.pseudo_student_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="가명 식별자 (실제 학번 아님)",
    )
    consent_type: Mapped[ConsentTypeEnum] = mapped_column(
        Enum(ConsentTypeEnum),
        ForeignKey("consent_types.type_code"),
        nullable=False,
    )
    # 동의 여부
    granted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        comment="동의(True) 또는 철회(False)",
    )
    # 동의 시각
    granted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="동의 시각",
    )
    # 철회 시각
    revoked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="동의 철회 시각",
    )
    # IP 해시 (직접 IP 저장 금지)
    ip_hash: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        comment="IP 주소 SHA-256 해시 (원본 저장 금지)",
    )
    # 동의서 버전
    consent_version: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="1.0",
        comment="동의 시점의 동의서 버전",
    )

    # 관계 정의
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[pseudo_student_id],
        primaryjoin="ConsentRecord.pseudo_student_id == User.pseudo_student_id",
        back_populates="consent_records",
    )
    consent_type_obj: Mapped["ConsentType"] = relationship(
        "ConsentType",
        foreign_keys=[consent_type],
        back_populates="consent_records",
    )

    def __repr__(self) -> str:
        return f"<ConsentRecord pseudo_id={self.pseudo_student_id} type={self.consent_type} granted={self.granted}>"
