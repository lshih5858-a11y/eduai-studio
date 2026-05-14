"""개입(Intervention) 관련 Pydantic 스키마."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.intervention import InterventionStatus, InterventionType, UrgencyLevel


class InterventionCreate(BaseModel):
    """개입 생성 요청 스키마."""

    target_pseudo_student_id: str = Field(..., description="개입 대상 학습자의 가명 식별자")
    intervention_type: InterventionType = Field(..., description="개입 유형")
    message: str = Field(..., min_length=10, max_length=2000, description="개입 메시지")
    urgency_level: UrgencyLevel = Field(default=UrgencyLevel.MEDIUM, description="긴급도")
    risk_prediction_id: Optional[UUID] = Field(None, description="개입 근거 위험 예측 ID")


class InterventionApprovalAction(BaseModel):
    """개입 승인/거부 액션 스키마."""

    note: Optional[str] = Field(None, max_length=1000, description="승인/거부 사유")


class InterventionApprovalRead(BaseModel):
    """개입 승인 기록 응답 스키마."""

    id: UUID
    approver_pseudo_id: str
    approved: bool
    note: Optional[str]
    decided_at: datetime


class InterventionRead(BaseModel):
    """개입 조회 응답 스키마."""

    model_config = {"from_attributes": True}

    id: UUID
    target_pseudo_student_id: str
    creator_pseudo_id: str
    intervention_type: InterventionType
    status: InterventionStatus
    urgency_level: UrgencyLevel
    message: str
    risk_prediction_id: Optional[UUID]
    delivered_at: Optional[datetime]
    approval: Optional[InterventionApprovalRead]
    created_at: datetime
