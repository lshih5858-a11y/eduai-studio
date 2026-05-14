"""동의 관리 API 엔드포인트.

동의 유형 조회, 동의 부여/철회, 동의 이력 조회 기능을 제공합니다.
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db
from app.schemas.consent import ConsentGrantRequest, ConsentHistoryRead, ConsentTypeRead
from app.services.consent_service import ConsentService

router = APIRouter()


@router.get("/types", response_model=list[ConsentTypeRead], summary="동의 유형 목록")
async def list_consent_types(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> list[ConsentTypeRead]:
    """사용 가능한 모든 동의 유형을 반환합니다."""
    service = ConsentService(db)
    return await service.get_consent_types()


@router.post("/grant", response_model=ConsentHistoryRead, summary="동의 부여")
async def grant_consent(
    request: Request,
    body: ConsentGrantRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> ConsentHistoryRead:
    """특정 동의 유형에 동의합니다."""
    service = ConsentService(db)
    client_ip = request.client.host if request.client else "unknown"
    return await service.grant_consent(
        pseudo_student_id=current_user.pseudo_student_id,
        consent_type=body.consent_type,
        consent_version=body.consent_version,
        ip_address=client_ip,
    )


@router.post("/revoke", response_model=ConsentHistoryRead, summary="동의 철회")
async def revoke_consent(
    request: Request,
    body: ConsentGrantRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> ConsentHistoryRead:
    """특정 동의 유형에 대한 동의를 철회합니다."""
    service = ConsentService(db)
    client_ip = request.client.host if request.client else "unknown"
    return await service.revoke_consent(
        pseudo_student_id=current_user.pseudo_student_id,
        consent_type=body.consent_type,
        ip_address=client_ip,
    )


@router.get("/history", response_model=list[ConsentHistoryRead], summary="동의 이력 조회")
async def get_consent_history(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> list[ConsentHistoryRead]:
    """현재 사용자의 동의 이력을 반환합니다."""
    service = ConsentService(db)
    return await service.get_history(current_user.pseudo_student_id)
