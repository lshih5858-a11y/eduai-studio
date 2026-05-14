"""개입(Intervention) API 엔드포인트.

개입 생성, 목록 조회, 승인/거부 기능을 제공합니다.
Human-in-the-loop: 모든 개입은 교수 또는 관리자 승인 후에만 전달됩니다.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db, require_role
from app.models.user import UserRole
from app.schemas.intervention import (
    InterventionApprovalAction,
    InterventionCreate,
    InterventionRead,
)
from app.services.intervention_service import InterventionService

router = APIRouter()


@router.get("", response_model=list[InterventionRead], summary="개입 목록 조회")
async def list_interventions(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    status_filter: str | None = Query(None, description="상태 필터 (PENDING_APPROVAL/APPROVED/REJECTED/DELIVERED)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[InterventionRead]:
    """개입 목록을 반환합니다.

    학생은 자신에게 향한 개입만, 교수/관리자는 모든 개입을 볼 수 있습니다.
    """
    service = InterventionService(db)
    return await service.list_interventions(
        requester=current_user,
        status_filter=status_filter,
        skip=skip,
        limit=limit,
    )


@router.post("", response_model=InterventionRead, status_code=201, summary="개입 생성")
async def create_intervention(
    body: InterventionCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> InterventionRead:
    """새 개입을 생성합니다.

    생성된 개입은 PENDING_APPROVAL 상태로 설정됩니다.
    교수 또는 관리자 승인 전까지 학생에게 전달되지 않습니다.
    """
    service = InterventionService(db)
    return await service.create_intervention(
        creator=current_user,
        target_pseudo_id=body.target_pseudo_student_id,
        intervention_type=body.intervention_type,
        message=body.message,
        urgency_level=body.urgency_level,
    )


@router.post(
    "/{intervention_id}/approve",
    response_model=InterventionRead,
    summary="개입 승인",
    dependencies=[Depends(require_role(UserRole.PROFESSOR, UserRole.ADMIN))],
)
async def approve_intervention(
    intervention_id: UUID,
    body: InterventionApprovalAction,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> InterventionRead:
    """개입 요청을 승인합니다.

    교수 또는 관리자만 승인 가능합니다.
    승인 후 개입이 학생에게 전달됩니다.
    """
    service = InterventionService(db)
    return await service.approve_intervention(
        intervention_id=intervention_id,
        approver=current_user,
        note=body.note,
    )


@router.post(
    "/{intervention_id}/reject",
    response_model=InterventionRead,
    summary="개입 거부",
    dependencies=[Depends(require_role(UserRole.PROFESSOR, UserRole.ADMIN))],
)
async def reject_intervention(
    intervention_id: UUID,
    body: InterventionApprovalAction,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> InterventionRead:
    """개입 요청을 거부합니다.

    교수 또는 관리자만 거부 가능합니다.
    """
    service = InterventionService(db)
    return await service.reject_intervention(
        intervention_id=intervention_id,
        approver=current_user,
        note=body.note,
    )
