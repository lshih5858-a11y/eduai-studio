"""학습 분석 API 엔드포인트.

개별 학습자 및 코호트 분석 데이터를 제공합니다.
"""
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db, require_role
from app.models.user import UserRole
from app.schemas.analytics import CohortStatsRead, LearnerSnapshotRead
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get(
    "/learner/{pseudo_student_id}",
    response_model=LearnerSnapshotRead,
    summary="개별 학습자 분석",
    dependencies=[Depends(require_role(UserRole.PROFESSOR, UserRole.ADMIN, UserRole.RESEARCHER))],
)
async def get_learner_analytics(
    pseudo_student_id: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> LearnerSnapshotRead:
    """특정 학습자의 위험 점수와 분석 데이터를 반환합니다.

    SHAP 기반 reason code를 포함합니다.
    교수, 관리자, 연구자만 접근 가능합니다.
    """
    service = AnalyticsService(db)
    return await service.get_learner_snapshot(pseudo_student_id)


@router.get(
    "/cohort/{course_id}",
    response_model=CohortStatsRead,
    summary="코호트 분석",
    dependencies=[Depends(require_role(UserRole.PROFESSOR, UserRole.ADMIN, UserRole.RESEARCHER))],
)
async def get_cohort_analytics(
    course_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> CohortStatsRead:
    """특정 강좌의 코호트 분석 통계를 반환합니다.

    위험도 분포, 평균 점수, 참여도 통계를 포함합니다.
    """
    service = AnalyticsService(db)
    return await service.get_cohort_stats(course_id)
