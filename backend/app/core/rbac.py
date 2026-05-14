"""역할 기반 접근 제어(RBAC) 모듈.

권한 매트릭스와 접근 제어 유틸리티를 제공합니다.
"""
import enum
import functools
from typing import Any, Callable, TypeVar

from fastapi import HTTPException, status

from app.models.user import UserRole

F = TypeVar("F", bound=Callable[..., Any])


class Permission(str, enum.Enum):
    """권한 열거형."""

    # 사용자 관련
    USER_READ_SELF = "user:read:self"
    USER_READ_ANY = "user:read:any"
    USER_UPDATE_SELF = "user:update:self"
    USER_UPDATE_ANY = "user:update:any"
    USER_DELETE = "user:delete"

    # 강좌 관련
    COURSE_READ = "course:read"
    COURSE_CREATE = "course:create"
    COURSE_UPDATE = "course:update"
    COURSE_DELETE = "course:delete"
    ENROLLMENT_READ_OWN = "enrollment:read:own"
    ENROLLMENT_READ_ALL = "enrollment:read:all"

    # 동의 관련
    CONSENT_READ_SELF = "consent:read:self"
    CONSENT_GRANT = "consent:grant"
    CONSENT_REVOKE = "consent:revoke"

    # 분석 관련
    ANALYTICS_READ_OWN = "analytics:read:own"
    ANALYTICS_READ_COURSE = "analytics:read:course"
    ANALYTICS_READ_ALL = "analytics:read:all"

    # 개입 관련
    INTERVENTION_CREATE = "intervention:create"
    INTERVENTION_READ_OWN = "intervention:read:own"
    INTERVENTION_READ_ALL = "intervention:read:all"
    INTERVENTION_APPROVE = "intervention:approve"
    INTERVENTION_REJECT = "intervention:reject"

    # PII 관련
    PII_MAP_READ = "pii:map:read"
    PII_MAP_CREATE = "pii:map:create"


# 역할별 권한 매트릭스
ROLE_PERMISSIONS: dict[UserRole, set[Permission]] = {
    UserRole.STUDENT: {
        Permission.USER_READ_SELF,
        Permission.USER_UPDATE_SELF,
        Permission.COURSE_READ,
        Permission.ENROLLMENT_READ_OWN,
        Permission.CONSENT_READ_SELF,
        Permission.CONSENT_GRANT,
        Permission.CONSENT_REVOKE,
        Permission.ANALYTICS_READ_OWN,
        Permission.INTERVENTION_READ_OWN,
    },
    UserRole.ASSISTANT: {
        Permission.USER_READ_SELF,
        Permission.USER_UPDATE_SELF,
        Permission.USER_READ_ANY,
        Permission.COURSE_READ,
        Permission.ENROLLMENT_READ_ALL,
        Permission.CONSENT_READ_SELF,
        Permission.CONSENT_GRANT,
        Permission.CONSENT_REVOKE,
        Permission.ANALYTICS_READ_OWN,
        Permission.ANALYTICS_READ_COURSE,
        Permission.INTERVENTION_CREATE,
        Permission.INTERVENTION_READ_ALL,
    },
    UserRole.PROFESSOR: {
        Permission.USER_READ_SELF,
        Permission.USER_UPDATE_SELF,
        Permission.USER_READ_ANY,
        Permission.COURSE_READ,
        Permission.COURSE_CREATE,
        Permission.COURSE_UPDATE,
        Permission.ENROLLMENT_READ_ALL,
        Permission.CONSENT_READ_SELF,
        Permission.CONSENT_GRANT,
        Permission.CONSENT_REVOKE,
        Permission.ANALYTICS_READ_OWN,
        Permission.ANALYTICS_READ_COURSE,
        Permission.INTERVENTION_CREATE,
        Permission.INTERVENTION_READ_ALL,
        Permission.INTERVENTION_APPROVE,
        Permission.INTERVENTION_REJECT,
    },
    UserRole.RESEARCHER: {
        Permission.USER_READ_SELF,
        Permission.USER_UPDATE_SELF,
        Permission.COURSE_READ,
        Permission.CONSENT_READ_SELF,
        Permission.CONSENT_GRANT,
        Permission.CONSENT_REVOKE,
        Permission.ANALYTICS_READ_ALL,
    },
    UserRole.ADMIN: {
        # 관리자는 모든 권한 보유
        perm
        for perm in Permission
    },
}


def has_permission(role: UserRole, permission: Permission) -> bool:
    """특정 역할이 권한을 보유하는지 확인합니다.

    Args:
        role: 사용자 역할
        permission: 확인할 권한

    Returns:
        권한 보유 여부
    """
    return permission in ROLE_PERMISSIONS.get(role, set())


def require_permission(permission: Permission) -> Callable[[F], F]:
    """특정 권한을 요구하는 데코레이터.

    FastAPI 라우트 함수에 적용합니다.

    Args:
        permission: 요구하는 권한

    Returns:
        데코레이터 함수
    """

    def decorator(func: F) -> F:
        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # current_user 인자 추출
            current_user = kwargs.get("current_user")
            if current_user is None:
                # 위치 인자에서 User 타입 찾기
                for arg in args:
                    if hasattr(arg, "role"):
                        current_user = arg
                        break

            if current_user is None or not has_permission(current_user.role, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"이 작업에는 {permission.value} 권한이 필요합니다.",
                )
            return await func(*args, **kwargs)

        return wrapper  # type: ignore[return-value]

    return decorator


def get_user_permissions(role: UserRole) -> list[str]:
    """역할의 모든 권한 목록을 반환합니다.

    Args:
        role: 사용자 역할

    Returns:
        권한 문자열 목록
    """
    return [perm.value for perm in ROLE_PERMISSIONS.get(role, set())]
