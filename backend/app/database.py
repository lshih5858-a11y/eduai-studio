"""데이터베이스 연결 및 세션 관리 모듈.

SQLAlchemy 2.0 비동기 엔진과 세션 팩토리를 설정합니다.
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import get_settings

settings = get_settings()

# 비동기 엔진 생성
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# 비동기 세션 팩토리
AsyncSessionFactory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# 테스트용 엔진 (커넥션 풀 없음)
test_engine = create_async_engine(
    settings.database_url,
    echo=True,
    poolclass=NullPool,
)

TestAsyncSessionFactory = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """데이터베이스 세션을 생성하고 반환합니다.

    FastAPI 의존성 주입에 사용됩니다.
    """
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """데이터베이스 초기화를 수행합니다.

    PII 스키마를 생성합니다.
    """
    from app.models.base import Base

    async with engine.begin() as conn:
        # PII 스키마 생성
        await conn.execute(
            __import__("sqlalchemy").text(f"CREATE SCHEMA IF NOT EXISTS {settings.pii_database_schema}")
        )
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """데이터베이스 연결을 종료합니다."""
    await engine.dispose()
