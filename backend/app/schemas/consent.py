"""동의 관리 관련 Pydantic 스키마."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.consent import ConsentTypeEnum


class ConsentTypeRead(BaseModel):
    """동의 유형 조회 응답 스키마."""

    model_config = {"from_attributes": True}

    id: UUID
    type_code: ConsentTypeEnum
    title_ko: str
    description_ko: str
    is_required: bool
    current_version: str


class ConsentGrantRequest(BaseModel):
    """동의 부여/철회 요청 스키마."""

    consent_type: ConsentTypeEnum = Field(..., description="동의 유형")
    consent_version: str = Field(default="1.0", description="동의서 버전")


class ConsentHistoryRead(BaseModel):
    """동의 이력 조회 응답 스키마."""

    model_config = {"from_attributes": True}

    id: UUID
    pseudo_student_id: str
    consent_type: ConsentTypeEnum
    granted: bool
    granted_at: Optional[datetime]
    revoked_at: Optional[datetime]
    consent_version: str
    created_at: datetime
