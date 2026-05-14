"""강좌 관련 Pydantic 스키마."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.course import EnrollmentStatus


class CourseRead(BaseModel):
    """강좌 조회 응답 스키마."""

    model_config = {"from_attributes": True}

    id: UUID
    course_code: str
    title: str
    description: Optional[str]
    institution_code: str
    semester: str
    professor_pseudo_id: str
    max_students: Optional[int]
    created_at: datetime


class EnrollmentRead(BaseModel):
    """수강 등록 조회 응답 스키마."""

    model_config = {"from_attributes": True}

    id: UUID
    pseudo_student_id: str
    course_id: UUID
    status: EnrollmentStatus
    grade: Optional[str]
    created_at: datetime
