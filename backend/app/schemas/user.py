"""사용자 관련 Pydantic 스키마."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.user import UserRole


class UserCreate(BaseModel):
    """사용자 생성 요청 스키마."""

    pseudo_student_id: str = Field(..., max_length=64, description="가명 식별자")
    display_name: str = Field(..., max_length=100, description="표시 이름")
    role: UserRole = Field(default=UserRole.STUDENT, description="사용자 역할")
    institution_code: str = Field(..., max_length=20, description="소속 기관 코드")
    password: str = Field(..., min_length=8, description="비밀번호")


class UserRead(BaseModel):
    """사용자 조회 응답 스키마 (기본)."""

    model_config = {"from_attributes": True}

    id: UUID
    pseudo_student_id: str
    display_name: str
    role: UserRole
    institution_code: str
    is_active: bool
    created_at: datetime


class UserProfile(BaseModel):
    """사용자 프로필 응답 스키마 (상세)."""

    model_config = {"from_attributes": True}

    id: UUID
    pseudo_student_id: str
    display_name: str
    role: UserRole
    institution_code: str
    is_active: bool
    last_login_at: Optional[datetime]
    created_at: datetime


class UserUpdate(BaseModel):
    """사용자 정보 수정 요청 스키마."""

    display_name: Optional[str] = Field(None, max_length=100, description="변경할 표시 이름")
