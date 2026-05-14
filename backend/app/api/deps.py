"""FastAPI 공용 의존성 모듈.

get_db, get_current_user, require_role 등 공유 의존성을 제공합니다.
"""
from typing import Annotated, AsyncGenerator
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_access_token
from app.database import get_db_session
from app.models.user import User, UserRole

# HTTP Bearer 스키마
bearer_scheme = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """데이터베이스 세션 의존성."""
    async for session in get_db_session():
        yield session


DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: DbSession,
) -> User:
    """현재 인증된 사용자를 반환합니다.

    JWT 토큰을 검증하고 해당 사용자를 DB에서 조회합니다.
    """
    token = credentials.credentials
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않거나 만료된 토큰입니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    pseudo_id: str | None = payload.get("sub")
    if pseudo_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰에 사용자 정보가 없습니다.",
        )

    result = await db.execute(select(User).where(User.pseudo_student_id == pseudo_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없거나 비활성화된 계정입니다.",
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: UserRole):
    """특정 역할을 요구하는 의존성 팩토리.

    사용 예: Depends(require_role(UserRole.ADMIN, UserRole.PROFESSOR))
    """

    async def role_checker(current_user: CurrentUser) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"해당 작업은 {[r.value for r in roles]} 역할이 필요합니다.",
            )
        return current_user

    return role_checker


def require_professor_or_admin():
    """교수 또는 관리자 역할 요구 의존성."""
    return require_role(UserRole.PROFESSOR, UserRole.ADMIN)


def require_admin():
    """관리자 역할만 요구하는 의존성."""
    return require_role(UserRole.ADMIN)
