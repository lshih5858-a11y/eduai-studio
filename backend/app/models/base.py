"""SQLAlchemy 기본 모델 및 믹스인 정의.

모든 모델이 공유하는 기본 클래스와 타임스탬프 믹스인을 제공합니다.
"""
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """모든 SQLAlchemy 모델의 선언적 기본 클래스."""
    pass


class TimestampMixin:
    """생성/수정 시각 자동 기록 믹스인.

    모든 모델에 created_at, updated_at 컬럼을 추가합니다.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
