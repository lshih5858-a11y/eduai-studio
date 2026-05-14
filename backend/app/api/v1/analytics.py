"""학습 분석 API 엔드포인트.

개별 학습자 및 코호트 분석 데이터를 제공합니다.
"""
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db, require_role
from app.models.user import UserRole
from app.schemas.analytics import (
    CohortStatsRead,
    DashboardStatsRead,
    LearnerRiskRead,
    LearnerSnapshotRead,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get(
    "/dashboard-stats",
    response_model=DashboardStatsRead,
    summary="대시보드 요약 통계",
    dependencies=[Depends(require_role(UserRole.PROFESSOR, UserRole.ADMIN, UserRole.RESEARCHER))],
)
async def get_dashboard_stats(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> DashboardStatsRead:
    """대시보드에 표시할 전체 통계를 반환합니다.

    전체 학습자 수, 고위험 학습자 수, 승인 대기 개입 수, 평균 완료율을 포함합니다.
    교수, 관리자, 연구자만 접근 가능합니다.
    """
    service = AnalyticsService(db)
    return await service.get_dashboard_stats()


@router.get(
    "/cohort",
    response_model=list[LearnerRiskRead],
    summary="전체 코호트 위험도 목록",
    dependencies=[Depends(require_role(UserRole.PROFESSOR, UserRole.ADMIN, UserRole.RESEARCHER))],
)
async def list_cohort_risks(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> list[LearnerRiskRead]:
    """전체 학습자의 위험도 요약 목록을 반환합니다.

    코호트 분석 페이지의 학습자 목록에 사용됩니다.
    교수, 관리자, 연구자만 접근 가능합니다.
    """
    service = AnalyticsService(db)
    return await service.list_all_learner_risks()


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

    SHAP 기반 reason code, 학습 진도 곡선, AI 권장 개입을 포함합니다.
    교수, 관리자, 연구자만 접근 가능합니다.
    """
    service = AnalyticsService(db)
    return await service.get_learner_snapshot(pseudo_student_id)


@router.get(
    "/cohort/{course_id}",
    response_model=CohortStatsRead,
    summary="강좌별 코호트 분석",
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
