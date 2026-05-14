"""감사 로그 모델 정의.

append-only 감사 로그 테이블을 정의합니다.
"""
import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AuditLog(Base):
    """감사 로그 테이블.

    append-only 원칙을 따릅니다. UPDATE/DELETE를 수행하지 않습니다.
    모든 PII 필드 접근과 관리자 행위를 기록합니다.
    """

    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_actor_occurred", "actor_pseudo_id", "occurred_at"),
        Index("ix_audit_resource", "resource_type", "resource_id"),
        {"comment": "append-only 감사 로그 - UPDATE/DELETE 금지"},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    # 행위자 가명 식별자
    actor_pseudo_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="행위를 수행한 사용자의 가명 식별자",
    )
    # 수행된 행위
    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="수행된 행위 코드",
    )
    # 리소스 유형
    resource_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="접근한 리소스 유형",
    )
    # 리소스 ID
    resource_id: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        comment="접근한 리소스 식별자",
    )
    # IP 해시 (원본 저장 금지)
    ip_hash: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        comment="IP 주소 SHA-256 해시",
    )
    # User-Agent 해시
    user_agent_hash: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        comment="User-Agent SHA-256 해시",
    )
    # 추가 데이터 (JSONB)
    extra_data: Mapped[Optional[Any]] = mapped_column(
        JSONB,
        nullable=True,
        comment="추가 컨텍스트 데이터",
    )
    # 발생 시각
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="이벤트 발생 시각",
    )

    def __repr__(self) -> str:
        return f"<AuditLog actor={self.actor_pseudo_id} action={self.action} at={self.occurred_at}>"
