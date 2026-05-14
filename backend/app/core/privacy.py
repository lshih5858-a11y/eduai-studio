"""가명화 서비스 모듈.

실제 student_id와 pseudo_student_id 간의 매핑을 관리합니다.
PII 접근은 항상 감사 로그와 함께 수행됩니다.
"""
import hashlib
import hmac

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.audit import AuditAction, AuditLogger

settings = get_settings()


class PseudonymizationService:
    """가명화 서비스 클래스.

    student_id <-> pseudo_student_id 매핑을 관리합니다.
    모든 PII 접근은 감사 로그와 함께 기록됩니다.
    """

    def __init__(self, db: AsyncSession) -> None:
        """서비스 초기화.

        Args:
            db: 비동기 SQLAlchemy 세션
        """
        self.db = db
        self.audit_logger = AuditLogger(db)

    def generate_pseudo_id(self, student_id: str) -> str:
        """학번으로부터 가명 식별자를 생성합니다.

        HMAC-SHA256을 사용하여 결정적이지만 역방향 불가능한 가명 식별자를 생성합니다.

        Args:
            student_id: 실제 학번 (PII)

        Returns:
            64자 16진수 가명 식별자
        """
        return hmac.new(
            settings.pseudonym_salt.encode(),
            student_id.encode(),
            hashlib.sha256,
        ).hexdigest()

    async def get_or_create_mapping(
        self,
        student_id: str,
        created_by: str,
    ) -> str:
        """학번에 대한 가명 식별자를 조회하거나 새로 생성합니다.

        Args:
            student_id: 실제 학번 (PII)
            created_by: 매핑 생성 요청자의 pseudo_student_id

        Returns:
            가명 식별자 문자열
        """
        pseudo_id = self.generate_pseudo_id(student_id)

        # 기존 매핑 조회 (pii 스키마)
        result = await self.db.execute(
            text("SELECT pseudo_student_id FROM pii.user_identity_map WHERE student_id = :sid"),
            {"sid": student_id},
        )
        row = result.fetchone()

        if row is not None:
            existing_pseudo_id: str = row[0]
            # 기존 접근 감사 기록
            await self.audit_logger.log(
                action=AuditAction.PII_READ,
                actor_pseudo_id=created_by,
                resource_type="user_identity_map",
                resource_id=existing_pseudo_id,
            )
            return existing_pseudo_id

        # 새 매핑 생성
        from uuid import uuid4

        await self.db.execute(
            text("""
                INSERT INTO pii.user_identity_map (id, student_id, pseudo_student_id, created_by)
                VALUES (:id, :student_id, :pseudo_id, :created_by)
            """),
            {
                "id": str(uuid4()),
                "student_id": student_id,
                "pseudo_id": pseudo_id,
                "created_by": created_by,
            },
        )
        await self.audit_logger.log(
            action=AuditAction.PII_MAP_CREATE,
            actor_pseudo_id=created_by,
            resource_type="user_identity_map",
            resource_id=pseudo_id,
        )
        return pseudo_id

    async def lookup_student_id(
        self,
        pseudo_student_id: str,
        accessor_pseudo_id: str,
        reason: str,
    ) -> str | None:
        """가명 식별자로 실제 학번을 조회합니다.

        이 함수는 항상 감사 로그를 기록합니다.
        긴급한 경우(예: 개입 필요)에만 사용해야 합니다.

        Args:
            pseudo_student_id: 조회할 가명 식별자
            accessor_pseudo_id: 조회자의 가명 식별자
            reason: 조회 사유 (감사 기록용)

        Returns:
            실제 학번 또는 None (매핑 없는 경우)
        """
        # PII 접근 감사 기록
        await self.audit_logger.log_pii_access(
            actor_pseudo_id=accessor_pseudo_id,
            accessed_pseudo_id=pseudo_student_id,
            reason=reason,
        )

        result = await self.db.execute(
            text("SELECT student_id FROM pii.user_identity_map WHERE pseudo_student_id = :pid"),
            {"pid": pseudo_student_id},
        )
        row = result.fetchone()
        if row is None:
            return None
        student_id: str = row[0]
        return student_id

    async def pseudo_id_exists(self, pseudo_student_id: str) -> bool:
        """가명 식별자가 존재하는지 확인합니다 (PII 접근 없음).

        Args:
            pseudo_student_id: 확인할 가명 식별자

        Returns:
            존재 여부
        """
        result = await self.db.execute(
            text("SELECT 1 FROM pii.user_identity_map WHERE pseudo_student_id = :pid LIMIT 1"),
            {"pid": pseudo_student_id},
        )
        return result.fetchone() is not None
