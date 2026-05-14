"""감사 로그 모듈.

PII 접근 및 관리자 행위를 append-only 방식으로 기록합니다.
"""
import enum
import functools
import hashlib
from datetime import datetime, timezone
from typing import Any, Callable, TypeVar
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings

settings = get_settings()

F = TypeVar("F", bound=Callable[..., Any])


class AuditAction(str, enum.Enum):
    """감사 로그 행위 열거형."""

    # 인증 관련
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILURE = "LOGIN_FAILURE"
    LOGOUT = "LOGOUT"
    TOKEN_REFRESH = "TOKEN_REFRESH"

    # PII 접근 관련
    PII_READ = "PII_READ"
    PII_MAP_CREATE = "PII_MAP_CREATE"
    PII_MAP_DELETE = "PII_MAP_DELETE"

    # 동의 관련
    CONSENT_GRANT = "CONSENT_GRANT"
    CONSENT_REVOKE = "CONSENT_REVOKE"

    # 분석 접근
    ANALYTICS_READ = "ANALYTICS_READ"
    RISK_SCORE_READ = "RISK_SCORE_READ"

    # 개입 관련
    INTERVENTION_CREATE = "INTERVENTION_CREATE"
    INTERVENTION_APPROVE = "INTERVENTION_APPROVE"
    INTERVENTION_REJECT = "INTERVENTION_REJECT"

    # 관리자 작업
    ADMIN_USER_UPDATE = "ADMIN_USER_UPDATE"
    ADMIN_ROLE_CHANGE = "ADMIN_ROLE_CHANGE"


class AuditLogger:
    """감사 로그 기록 클래스.

    모든 PII 접근 및 관리자 행위를 audit_log 테이블에 append-only로 기록합니다.
    """

    def __init__(self, db: AsyncSession) -> None:
        """AuditLogger 초기화.

        Args:
            db: 비동기 SQLAlchemy 세션
        """
        self.db = db

    async def log(
        self,
        action: AuditAction,
        actor_pseudo_id: str,
        resource_type: str,
        resource_id: str | None = None,
        ip_hash: str | None = None,
        user_agent_hash: str | None = None,
        extra_data: dict[str, Any] | None = None,
    ) -> None:
        """감사 로그를 기록합니다.

        Args:
            action: 수행된 행위
            actor_pseudo_id: 행위자의 가명 식별자
            resource_type: 접근한 리소스 유형
            resource_id: 접근한 리소스 ID
            ip_hash: 해싱된 IP 주소
            user_agent_hash: 해싱된 User-Agent
            extra_data: 추가 컨텍스트 데이터
        """
        import json

        now = datetime.now(timezone.utc)
        extra_json = json.dumps(extra_data) if extra_data else None

        # INSERT INTO 직접 실행 (ORM 모델 순환 임포트 방지)
        # asyncpg named param + ::jsonb 혼용 불가 → CAST() 사용
        await self.db.execute(
            text("""
                INSERT INTO audit_logs (
                    id, actor_pseudo_id, action, resource_type, resource_id,
                    ip_hash, user_agent_hash, extra_data, occurred_at
                ) VALUES (
                    :id, :actor_pseudo_id, :action, :resource_type, :resource_id,
                    :ip_hash, :user_agent_hash, CAST(:extra_data AS jsonb), :occurred_at
                )
            """),
            {
                "id": str(uuid4()),
                "actor_pseudo_id": actor_pseudo_id,
                "action": action.value,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "ip_hash": ip_hash,
                "user_agent_hash": user_agent_hash,
                "extra_data": extra_json,
                "occurred_at": now,
            },
        )
        # 감사 로그는 즉시 플러시 (커밋은 호출자가 담당)
        await self.db.flush()

    async def log_pii_access(
        self,
        actor_pseudo_id: str,
        accessed_pseudo_id: str,
        reason: str,
        ip_hash: str | None = None,
    ) -> None:
        """PII 접근을 기록합니다.

        Args:
            actor_pseudo_id: 접근자의 가명 식별자
            accessed_pseudo_id: 접근된 대상의 가명 식별자
            reason: 접근 사유
            ip_hash: 해싱된 IP 주소
        """
        await self.log(
            action=AuditAction.PII_READ,
            actor_pseudo_id=actor_pseudo_id,
            resource_type="user_identity_map",
            resource_id=accessed_pseudo_id,
            ip_hash=ip_hash,
            extra_data={"reason": reason},
        )


def audit_access(action: AuditAction, resource_type: str) -> Callable[[F], F]:
    """PII 접근 함수를 감사 로그로 감싸는 데코레이터.

    사용 예:
        @audit_access(AuditAction.PII_READ, "user_identity_map")
        async def get_student_id(pseudo_id: str, db: AsyncSession) -> str:
            ...

    Args:
        action: 감사할 행위
        resource_type: 리소스 유형 문자열

    Returns:
        데코레이터 함수
    """

    def decorator(func: F) -> F:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # 함수 인자에서 db와 actor_pseudo_id 추출 시도
            db: AsyncSession | None = kwargs.get("db")
            actor_pseudo_id: str = kwargs.get("actor_pseudo_id", "system")
            resource_id: str | None = kwargs.get("resource_id") or kwargs.get("pseudo_student_id")

            result = await func(*args, **kwargs)

            # 감사 로그 기록 (DB가 있는 경우)
            if db is not None:
                logger = AuditLogger(db)
                await logger.log(
                    action=action,
                    actor_pseudo_id=actor_pseudo_id,
                    resource_type=resource_type,
                    resource_id=str(resource_id) if resource_id else None,
                )

            return result

        return wrapper  # type: ignore[return-value]

    return decorator
