"""동의 관리 서비스 모듈.

동의 부여, 철회, 이력 조회 비즈니스 로직을 담당합니다.
"""
import hashlib
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.audit import AuditAction, AuditLogger
from app.models.consent import ConsentRecord, ConsentType, ConsentTypeEnum
from app.schemas.consent import ConsentHistoryRead, ConsentTypeRead

settings = get_settings()


class ConsentService:
    """동의 관리 서비스 클래스."""

    def __init__(self, db: AsyncSession) -> None:
        """서비스 초기화.

        Args:
            db: 비동기 SQLAlchemy 세션
        """
        self.db = db
        self.audit_logger = AuditLogger(db)

    def _hash_ip(self, ip: str) -> str:
        """IP 주소를 SHA-256 해싱합니다."""
        return hashlib.sha256(f"{ip}{settings.pseudonym_salt}".encode()).hexdigest()

    async def get_consent_types(self) -> list[ConsentTypeRead]:
        """모든 동의 유형 목록을 반환합니다."""
        result = await self.db.execute(select(ConsentType))
        types = result.scalars().all()

        if not types:
            # 초기 데이터가 없으면 기본값 반환
            return [
                ConsentTypeRead(
                    id=uuid.uuid4(),
                    type_code=ConsentTypeEnum.SERVICE_USE,
                    title_ko="서비스 이용 동의",
                    description_ko="U-AI Compass 플랫폼 서비스 이용을 위한 기본 동의입니다.",
                    is_required=True,
                    current_version="1.0",
                ),
                ConsentTypeRead(
                    id=uuid.uuid4(),
                    type_code=ConsentTypeEnum.RESEARCH_PARTICIPATION,
                    title_ko="연구 참여 동의",
                    description_ko="학습 데이터를 교육 연구 목적으로 활용하는 것에 동의합니다.",
                    is_required=False,
                    current_version="1.0",
                ),
                ConsentTypeRead(
                    id=uuid.uuid4(),
                    type_code=ConsentTypeEnum.THIRD_PARTY_SHARING,
                    title_ko="제3자 제공 동의",
                    description_ko="소속 대학 외 제3자 기관에 학습 데이터를 제공하는 것에 동의합니다.",
                    is_required=False,
                    current_version="1.0",
                ),
                ConsentTypeRead(
                    id=uuid.uuid4(),
                    type_code=ConsentTypeEnum.AI_LOG_RESEARCH,
                    title_ko="AI 학습 로그 연구 활용 동의",
                    description_ko="AI 모델 개선을 위해 학습 활동 로그를 연구에 활용하는 것에 동의합니다.",
                    is_required=False,
                    current_version="1.0",
                ),
            ]

        return [
            ConsentTypeRead(
                id=ct.id,
                type_code=ct.type_code,
                title_ko=ct.title_ko,
                description_ko=ct.description_ko,
                is_required=ct.is_required,
                current_version=ct.current_version,
            )
            for ct in types
        ]

    async def grant_consent(
        self,
        pseudo_student_id: str,
        consent_type: ConsentTypeEnum,
        consent_version: str,
        ip_address: str,
    ) -> ConsentHistoryRead:
        """동의를 부여합니다.

        기존에 동의한 이력이 있어도 새 레코드를 추가합니다 (append-only).

        Args:
            pseudo_student_id: 동의하는 사용자의 가명 식별자
            consent_type: 동의 유형
            consent_version: 동의서 버전
            ip_address: 클라이언트 IP 주소

        Returns:
            생성된 동의 기록
        """
        now = datetime.now(timezone.utc)
        ip_hash = self._hash_ip(ip_address)

        record = ConsentRecord(
            id=uuid.uuid4(),
            pseudo_student_id=pseudo_student_id,
            consent_type=consent_type,
            granted=True,
            granted_at=now,
            revoked_at=None,
            ip_hash=ip_hash,
            consent_version=consent_version,
        )
        self.db.add(record)

        # 감사 로그 기록
        await self.audit_logger.log(
            action=AuditAction.CONSENT_GRANT,
            actor_pseudo_id=pseudo_student_id,
            resource_type="consent_record",
            resource_id=str(record.id),
            ip_hash=ip_hash,
            extra_data={"consent_type": consent_type.value, "version": consent_version},
        )

        await self.db.flush()
        await self.db.refresh(record)

        return ConsentHistoryRead(
            id=record.id,
            pseudo_student_id=record.pseudo_student_id,
            consent_type=record.consent_type,
            granted=record.granted,
            granted_at=record.granted_at,
            revoked_at=record.revoked_at,
            consent_version=record.consent_version,
            created_at=record.created_at,
        )

    async def revoke_consent(
        self,
        pseudo_student_id: str,
        consent_type: ConsentTypeEnum,
        ip_address: str,
    ) -> ConsentHistoryRead:
        """동의를 철회합니다.

        새 철회 레코드를 추가합니다 (append-only).

        Args:
            pseudo_student_id: 동의를 철회하는 사용자의 가명 식별자
            consent_type: 철회할 동의 유형
            ip_address: 클라이언트 IP 주소

        Returns:
            생성된 철회 기록
        """
        now = datetime.now(timezone.utc)
        ip_hash = self._hash_ip(ip_address)

        # 필수 동의는 철회 불가
        result = await self.db.execute(
            select(ConsentType).where(ConsentType.type_code == consent_type)
        )
        consent_type_obj = result.scalar_one_or_none()
        if consent_type_obj and consent_type_obj.is_required:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="필수 동의는 철회할 수 없습니다.",
            )

        record = ConsentRecord(
            id=uuid.uuid4(),
            pseudo_student_id=pseudo_student_id,
            consent_type=consent_type,
            granted=False,
            granted_at=None,
            revoked_at=now,
            ip_hash=ip_hash,
            consent_version="1.0",
        )
        self.db.add(record)

        # 감사 로그 기록
        await self.audit_logger.log(
            action=AuditAction.CONSENT_REVOKE,
            actor_pseudo_id=pseudo_student_id,
            resource_type="consent_record",
            resource_id=str(record.id),
            ip_hash=ip_hash,
            extra_data={"consent_type": consent_type.value},
        )

        await self.db.flush()
        await self.db.refresh(record)

        return ConsentHistoryRead(
            id=record.id,
            pseudo_student_id=record.pseudo_student_id,
            consent_type=record.consent_type,
            granted=record.granted,
            granted_at=record.granted_at,
            revoked_at=record.revoked_at,
            consent_version=record.consent_version,
            created_at=record.created_at,
        )

    async def get_history(self, pseudo_student_id: str) -> list[ConsentHistoryRead]:
        """동의 이력을 반환합니다.

        Args:
            pseudo_student_id: 조회할 사용자의 가명 식별자

        Returns:
            동의 이력 목록 (최신 순)
        """
        result = await self.db.execute(
            select(ConsentRecord)
            .where(ConsentRecord.pseudo_student_id == pseudo_student_id)
            .order_by(ConsentRecord.created_at.desc())
        )
        records = result.scalars().all()

        return [
            ConsentHistoryRead(
                id=r.id,
                pseudo_student_id=r.pseudo_student_id,
                consent_type=r.consent_type,
                granted=r.granted,
                granted_at=r.granted_at,
                revoked_at=r.revoked_at,
                consent_version=r.consent_version,
                created_at=r.created_at,
            )
            for r in records
        ]

    async def get_current_status(
        self,
        pseudo_student_id: str,
    ) -> list[ConsentHistoryRead]:
        """동의 유형별 최신 동의 현황을 반환합니다.

        각 동의 유형에 대해 가장 최신 레코드 1건씩 반환합니다.

        Args:
            pseudo_student_id: 조회할 사용자의 가명 식별자

        Returns:
            동의 유형별 최신 현황 목록
        """
        latest_records: list[ConsentHistoryRead] = []
        for consent_type in ConsentTypeEnum:
            result = await self.db.execute(
                select(ConsentRecord)
                .where(
                    ConsentRecord.pseudo_student_id == pseudo_student_id,
                    ConsentRecord.consent_type == consent_type,
                )
                .order_by(ConsentRecord.created_at.desc())
                .limit(1)
            )
            record = result.scalar_one_or_none()
            if record is not None:
                latest_records.append(
                    ConsentHistoryRead(
                        id=record.id,
                        pseudo_student_id=record.pseudo_student_id,
                        consent_type=record.consent_type,
                        granted=record.granted,
                        granted_at=record.granted_at,
                        revoked_at=record.revoked_at,
                        consent_version=record.consent_version,
                        created_at=record.created_at,
                    )
                )
        return latest_records

    async def has_valid_consent(
        self,
        pseudo_student_id: str,
        consent_type: ConsentTypeEnum,
    ) -> bool:
        """특정 동의가 현재 유효한지 확인합니다.

        Args:
            pseudo_student_id: 확인할 사용자의 가명 식별자
            consent_type: 확인할 동의 유형

        Returns:
            동의 유효 여부
        """
        result = await self.db.execute(
            select(ConsentRecord)
            .where(
                ConsentRecord.pseudo_student_id == pseudo_student_id,
                ConsentRecord.consent_type == consent_type,
            )
            .order_by(ConsentRecord.created_at.desc())
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        if latest is None:
            return False
        return latest.granted
