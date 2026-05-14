"""강좌 API 엔드포인트.

강좌 목록 조회 및 수강 등록 현황 조회 기능을 제공합니다.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db
from app.models.course import Course, Enrollment
from app.schemas.course import CourseRead, EnrollmentRead

router = APIRouter()


@router.get("", response_model=list[CourseRead], summary="강좌 목록 조회")
async def list_courses(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    institution_code: str | None = Query(None, description="기관 코드 필터"),
    semester: str | None = Query(None, description="학기 필터 (예: 2026-1)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[CourseRead]:
    """강좌 목록을 반환합니다.

    기관 코드와 학기로 필터링할 수 있습니다.
    """
    query = select(Course)
    if institution_code:
        query = query.where(Course.institution_code == institution_code)
    if semester:
        query = query.where(Course.semester == semester)
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    courses = result.scalars().all()

    return [
        CourseRead(
            id=c.id,
            course_code=c.course_code,
            title=c.title,
            description=c.description,
            institution_code=c.institution_code,
            semester=c.semester,
            professor_pseudo_id=c.professor_pseudo_id,
            max_students=c.max_students,
            created_at=c.created_at,
        )
        for c in courses
    ]


@router.get("/{course_id}", response_model=CourseRead, summary="강좌 상세 조회")
async def get_course(
    course_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> CourseRead:
    """특정 강좌의 상세 정보를 반환합니다."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="강좌를 찾을 수 없습니다.",
        )
    return CourseRead(
        id=course.id,
        course_code=course.course_code,
        title=course.title,
        description=course.description,
        institution_code=course.institution_code,
        semester=course.semester,
        professor_pseudo_id=course.professor_pseudo_id,
        max_students=course.max_students,
        created_at=course.created_at,
    )


@router.get("/{course_id}/enrollments", response_model=list[EnrollmentRead], summary="수강 목록 조회")
async def get_course_enrollments(
    course_id: UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
) -> list[EnrollmentRead]:
    """특정 강좌의 수강 등록 목록을 반환합니다."""
    # 강좌 존재 확인
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    if course_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="강좌를 찾을 수 없습니다.",
        )

    result = await db.execute(
        select(Enrollment)
        .where(Enrollment.course_id == course_id)
        .offset(skip)
        .limit(limit)
    )
    enrollments = result.scalars().all()

    return [
        EnrollmentRead(
            id=e.id,
            pseudo_student_id=e.pseudo_student_id,
            course_id=e.course_id,
            status=e.status,
            grade=e.grade,
            created_at=e.created_at,
        )
        for e in enrollments
    ]
