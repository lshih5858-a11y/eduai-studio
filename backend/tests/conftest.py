"""pytest 픽스처 설정 파일.

비동기 테스트 클라이언트, 테스트 DB 세션, 사용자 픽스처를 제공합니다.
"""
import asyncio
import uuid
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.api.deps import get_db
from app.core.security import create_access_token, hash_password
from app.main import create_app
from app.models.base import Base
from app.models.user import User, UserRole

# 테스트용 SQLite (메모리) URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """세션 범위 이벤트 루프를 생성합니다."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """테스트용 DB 엔진을 생성합니다."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=NullPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """각 테스트에 독립적인 DB 세션을 제공합니다."""
    TestSessionFactory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    async with TestSessionFactory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """테스트용 FastAPI 비동기 HTTP 클라이언트를 반환합니다."""
    app = create_app()

    # DB 의존성을 테스트 세션으로 오버라이드
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def student_user(db_session: AsyncSession) -> User:
    """테스트용 학생 사용자 픽스처."""
    user = User(
        id=uuid.uuid4(),
        pseudo_student_id="test_student_pseudo_abc123",
        role=UserRole.STUDENT,
        display_name="테스트_학생",
        institution_code="TEST_UNIV",
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest_asyncio.fixture
async def professor_user(db_session: AsyncSession) -> User:
    """테스트용 교수 사용자 픽스처."""
    user = User(
        id=uuid.uuid4(),
        pseudo_student_id="test_professor_pseudo_def456",
        role=UserRole.PROFESSOR,
        display_name="테스트_교수",
        institution_code="TEST_UNIV",
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """테스트용 관리자 사용자 픽스처."""
    user = User(
        id=uuid.uuid4(),
        pseudo_student_id="test_admin_pseudo_ghi789",
        role=UserRole.ADMIN,
        display_name="테스트_관리자",
        institution_code="TEST_UNIV",
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


def make_auth_headers(user: User) -> dict[str, str]:
    """테스트용 JWT Authorization 헤더를 생성합니다.

    Args:
        user: 인증 헤더를 생성할 사용자

    Returns:
        Authorization 헤더 딕셔너리
    """
    token = create_access_token(
        subject=user.pseudo_student_id,
        extra_claims={"role": user.role.value},
    )
    return {"Authorization": f"Bearer {token}"}
