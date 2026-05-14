"""인증 API 엔드포인트.

로그인, 토큰 갱신, 로그아웃 기능을 제공합니다.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db
from app.schemas.auth import LoginRequest, RefreshRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=TokenResponse, summary="로그인")
async def login(
    request: Request,
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """사용자 로그인 처리.

    자격증명 검증 후 액세스 토큰과 리프레시 토큰을 발급합니다.
    """
    service = AuthService(db)
    client_ip = request.client.host if request.client else "unknown"
    return await service.login(body.pseudo_student_id, body.password, client_ip)


@router.post("/refresh", response_model=TokenResponse, summary="토큰 갱신")
async def refresh_token(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """리프레시 토큰으로 새 액세스 토큰을 발급합니다."""
    service = AuthService(db)
    result = await service.refresh_token(body.refresh_token)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다.",
        )
    return result


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="로그아웃")
async def logout(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> None:
    """현재 사용자를 로그아웃합니다.

    리프레시 토큰을 무효화합니다.
    """
    service = AuthService(db)
    await service.logout(current_user.pseudo_student_id)
