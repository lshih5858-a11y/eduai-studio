"""사용자 API 엔드포인트.

사용자 프로필 조회 및 수정 기능을 제공합니다. RBAC로 접근을 제한합니다.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db, require_role
from app.models.user import User, UserRole
from app.schemas.user import UserProfile, UserRead, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserProfile, summary="내 프로필 조회")
async def get_my_profile(current_user: CurrentUser) -> UserProfile:
    """현재 로그인한 사용자의 프로필을 반환합니다."""
    return UserProfile(
        id=current_user.id,
        pseudo_student_id=current_user.pseudo_student_id,
        display_name=current_user.display_name,
        role=current_user.role,
        institution_code=current_user.institution_code,
        is_active=current_user.is_active,
        last_login_at=current_user.last_login_at,
        created_at=current_user.created_at,
    )


@router.get(
    "/{user_id}",
    response_model=UserRead,
    summary="특정 사용자 조회",
    dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.PROFESSOR))],
)
async def get_user(
    user_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """특정 사용자 정보를 조회합니다.

    ADMIN 또는 PROFESSOR만 접근 가능합니다.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다.",
        )
    return UserRead(
        id=user.id,
        pseudo_student_id=user.pseudo_student_id,
        display_name=user.display_name,
        role=user.role,
        institution_code=user.institution_code,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.patch("/me", response_model=UserProfile, summary="내 프로필 수정")
async def update_my_profile(
    body: UserUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    """현재 사용자의 표시 이름을 수정합니다."""
    if body.display_name is not None:
        current_user.display_name = body.display_name
    await db.commit()
    await db.refresh(current_user)
    return UserProfile(
        id=current_user.id,
        pseudo_student_id=current_user.pseudo_student_id,
        display_name=current_user.display_name,
        role=current_user.role,
        institution_code=current_user.institution_code,
        is_active=current_user.is_active,
        last_login_at=current_user.last_login_at,
        created_at=current_user.created_at,
    )
