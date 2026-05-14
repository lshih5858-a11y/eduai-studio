"""개입 서비스 모듈.

개입 생성, 승인, 거부 비즈니스 로직을 담당합니다.
Human-in-the-loop 원칙을 강제합니다.
"""
import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.audit import AuditAction, AuditLogger
from app.models.intervention import (
    Intervention,
    InterventionApproval,
    InterventionStatus,
    InterventionType,
    UrgencyLevel,
)
from app.models.user import User, UserRole
from app.schemas.intervention import InterventionApprovalRead, InterventionRead


class InterventionService:
    """개입 서비스 클래스.

    Human-in-the-loop: 모든 개입은 교수/관리자 승인 후에만 전달됩니다.
    """

    def __init__(self, db: AsyncSession) -> None:
        """서비스 초기화.

        Args:
            db: 비동기 SQLAlchemy 세션
        """
        self.db = db
        self.audit_logger = AuditLogger(db)

    def _to_read_schema(self, intervention: Intervention) -> InterventionRead:
        """Intervention 모델을 응답 스키마로 변환합니다."""
        approval_read = None
        if intervention.approval:
            approval_read = InterventionApprovalRead(
                id=intervention.approval.id,
                approver_pseudo_id=intervention.approval.approver_pseudo_id,
                approved=intervention.approval.approved,
                note=intervention.approval.note,
                decided_at=intervention.approval.decided_at,
            )
        return InterventionRead(
            id=intervention.id,
            target_pseudo_student_id=intervention.target_pseudo_student_id,
            creator_pseudo_id=intervention.creator_pseudo_id,
            intervention_type=intervention.intervention_type,
            status=intervention.status,
            urgency_level=intervention.urgency_level,
            message=intervention.message,
            risk_prediction_id=intervention.risk_prediction_id,
            delivered_at=intervention.delivered_at,
            approval=approval_read,
            created_at=intervention.created_at,
        )

    async def list_interventions(
        self,
        requester: User,
        status_filter: str | None,
        skip: int,
        limit: int,
    ) -> list[InterventionRead]:
        """개입 목록을 반환합니다.

        학생은 자신이 대상인 개입만, 교수/관리자는 모든 개입을 볼 수 있습니다.

        Args:
            requester: 요청자 사용자 객체
            status_filter: 상태 필터 문자열
            skip: 건너뛸 항목 수
            limit: 최대 반환 수

        Returns:
            개입 목록
        """
        query = select(Intervention).options(selectinload(Intervention.approval))

        # 학생은 자신의 개입만 조회
        if requester.role == UserRole.STUDENT:
            query = query.where(
                Intervention.target_pseudo_student_id == requester.pseudo_student_id
            )
        # 교수는 자신이 생성하거나 대상인 개입만
        elif requester.role == UserRole.PROFESSOR:
            query = query.where(
                or_(
                    Intervention.creator_pseudo_id == requester.pseudo_student_id,
                    Intervention.target_pseudo_student_id == requester.pseudo_student_id,
                )
            )

        # 상태 필터 적용
        if status_filter:
            try:
                status_enum = InterventionStatus(status_filter)
                query = query.where(Intervention.status == status_enum)
            except ValueError:
                pass  # 유효하지 않은 상태값은 무시

        query = query.order_by(Intervention.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        interventions = result.scalars().all()

        return [self._to_read_schema(iv) for iv in interventions]

    async def create_intervention(
        self,
        creator: User,
        target_pseudo_id: str,
        intervention_type: InterventionType,
        message: str,
        urgency_level: UrgencyLevel,
    ) -> InterventionRead:
        """새 개입을 생성합니다.

        생성된 개입은 항상 PENDING_APPROVAL 상태입니다.
        Human-in-the-loop 원칙 적용.

        Args:
            creator: 개입 생성자 사용자 객체
            target_pseudo_id: 대상 학습자의 가명 식별자
            intervention_type: 개입 유형
            message: 개입 메시지
            urgency_level: 긴급도

        Returns:
            생성된 개입 정보

        Raises:
            HTTPException: 대상 사용자가 없는 경우
        """
        # 대상 사용자 존재 확인
        result = await self.db.execute(
            select(User).where(User.pseudo_student_id == target_pseudo_id)
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="개입 대상 사용자를 찾을 수 없습니다.",
            )

        intervention = Intervention(
            id=uuid.uuid4(),
            target_pseudo_student_id=target_pseudo_id,
            creator_pseudo_id=creator.pseudo_student_id,
            intervention_type=intervention_type,
            # Human-in-the-loop: 항상 PENDING_APPROVAL로 시작
            status=InterventionStatus.PENDING_APPROVAL,
            urgency_level=urgency_level,
            message=message,
        )
        self.db.add(intervention)

        # 감사 로그
        await self.audit_logger.log(
            action=AuditAction.INTERVENTION_CREATE,
            actor_pseudo_id=creator.pseudo_student_id,
            resource_type="intervention",
            resource_id=str(intervention.id),
            extra_data={
                "target": target_pseudo_id,
                "type": intervention_type.value,
                "urgency": urgency_level.value,
            },
        )

        await self.db.flush()
        await self.db.refresh(intervention)

        return InterventionRead(
            id=intervention.id,
            target_pseudo_student_id=intervention.target_pseudo_student_id,
            creator_pseudo_id=intervention.creator_pseudo_id,
            intervention_type=intervention.intervention_type,
            status=intervention.status,
            urgency_level=intervention.urgency_level,
            message=intervention.message,
            risk_prediction_id=intervention.risk_prediction_id,
            delivered_at=intervention.delivered_at,
            approval=None,
            created_at=intervention.created_at,
        )

    async def approve_intervention(
        self,
        intervention_id: UUID,
        approver: User,
        note: str | None,
    ) -> InterventionRead:
        """개입을 승인합니다.

        승인 후 상태를 APPROVED로 변경하고 전달 처리합니다.

        Args:
            intervention_id: 개입 UUID
            approver: 승인자 사용자 객체
            note: 승인 사유

        Returns:
            승인된 개입 정보

        Raises:
            HTTPException: 개입이 없거나 이미 처리된 경우
        """
        result = await self.db.execute(
            select(Intervention)
            .where(Intervention.id == intervention_id)
            .options(selectinload(Intervention.approval))
        )
        intervention = result.scalar_one_or_none()

        if intervention is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="개입을 찾을 수 없습니다.",
            )

        if intervention.status != InterventionStatus.PENDING_APPROVAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"PENDING_APPROVAL 상태의 개입만 승인할 수 있습니다. 현재 상태: {intervention.status.value}",
            )

        now = datetime.now(timezone.utc)

        # 상태 업데이트
        intervention.status = InterventionStatus.APPROVED
        intervention.delivered_at = now

        # 승인 기록 저장
        approval = InterventionApproval(
            id=uuid.uuid4(),
            intervention_id=intervention.id,
            approver_pseudo_id=approver.pseudo_student_id,
            approved=True,
            note=note,
            decided_at=now,
        )
        self.db.add(approval)
        intervention.approval = approval

        # 감사 로그
        await self.audit_logger.log(
            action=AuditAction.INTERVENTION_APPROVE,
            actor_pseudo_id=approver.pseudo_student_id,
            resource_type="intervention",
            resource_id=str(intervention_id),
            extra_data={"note": note},
        )

        await self.db.flush()

        return self._to_read_schema(intervention)

    async def reject_intervention(
        self,
        intervention_id: UUID,
        approver: User,
        note: str | None,
    ) -> InterventionRead:
        """개입을 거부합니다.

        Args:
            intervention_id: 개입 UUID
            approver: 거부자 사용자 객체
            note: 거부 사유

        Returns:
            거부된 개입 정보

        Raises:
            HTTPException: 개입이 없거나 이미 처리된 경우
        """
        result = await self.db.execute(
            select(Intervention)
            .where(Intervention.id == intervention_id)
            .options(selectinload(Intervention.approval))
        )
        intervention = result.scalar_one_or_none()

        if intervention is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="개입을 찾을 수 없습니다.",
            )

        if intervention.status != InterventionStatus.PENDING_APPROVAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"PENDING_APPROVAL 상태의 개입만 거부할 수 있습니다. 현재 상태: {intervention.status.value}",
            )

        now = datetime.now(timezone.utc)

        # 상태 업데이트
        intervention.status = InterventionStatus.REJECTED

        # 거부 기록 저장
        approval = InterventionApproval(
            id=uuid.uuid4(),
            intervention_id=intervention.id,
            approver_pseudo_id=approver.pseudo_student_id,
            approved=False,
            note=note,
            decided_at=now,
        )
        self.db.add(approval)
        intervention.approval = approval

        # 감사 로그
        await self.audit_logger.log(
            action=AuditAction.INTERVENTION_REJECT,
            actor_pseudo_id=approver.pseudo_student_id,
            resource_type="intervention",
            resource_id=str(intervention_id),
            extra_data={"note": note},
        )

        await self.db.flush()

        return self._to_read_schema(intervention)
