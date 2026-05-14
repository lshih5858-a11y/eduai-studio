"""보안 유틸리티 모듈.

JWT 생성/검증, 비밀번호 해싱, OIDC 토큰 검증을 담당합니다.
"""
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings

settings = get_settings()

# bcrypt 비밀번호 컨텍스트
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """비밀번호를 bcrypt로 해싱합니다."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호가 해시와 일치하는지 확인합니다."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """액세스 JWT 토큰을 생성합니다.

    Args:
        subject: 토큰 주체 (pseudo_student_id)
        extra_claims: 추가 클레임 딕셔너리
        expires_delta: 만료 시간 (기본: 설정값)

    Returns:
        서명된 JWT 문자열
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.jwt_access_token_expire_minutes)

    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": expire,
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> str:
    """리프레시 JWT 토큰을 생성합니다.

    Args:
        subject: 토큰 주체 (pseudo_student_id)

    Returns:
        서명된 리프레시 JWT 문자열
    """
    expires_delta = timedelta(days=settings.jwt_refresh_token_expire_days)
    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def verify_access_token(token: str) -> dict[str, Any] | None:
    """액세스 토큰을 검증하고 페이로드를 반환합니다.

    Args:
        token: JWT 문자열

    Returns:
        토큰 페이로드 딕셔너리, 검증 실패 시 None
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


def verify_refresh_token(token: str) -> dict[str, Any] | None:
    """리프레시 토큰을 검증하고 페이로드를 반환합니다.

    Args:
        token: JWT 문자열

    Returns:
        토큰 페이로드 딕셔너리, 검증 실패 시 None
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None


def hash_ip_address(ip: str) -> str:
    """IP 주소를 SHA-256으로 해싱합니다.

    원본 IP를 저장하지 않고 감사 목적으로만 사용합니다.
    """
    return hashlib.sha256(f"{ip}{settings.pseudonym_salt}".encode()).hexdigest()


def hash_user_agent(user_agent: str) -> str:
    """User-Agent 문자열을 SHA-256으로 해싱합니다."""
    return hashlib.sha256(user_agent.encode()).hexdigest()


async def verify_oidc_token(token: str) -> dict[str, Any] | None:
    """OIDC 토큰을 검증합니다.

    외부 SSO 서버의 공개키로 토큰을 검증합니다.
    개발 환경에서는 모의(mock) 검증을 수행합니다.

    Args:
        token: OIDC ID 토큰

    Returns:
        클레임 딕셔너리, 검증 실패 시 None
    """
    import httpx

    try:
        # OIDC 검색 문서에서 jwks_uri 획득
        discovery_url = f"{settings.oidc_provider_url}/.well-known/openid-configuration"
        async with httpx.AsyncClient(timeout=5.0) as client:
            discovery_resp = await client.get(discovery_url)
            discovery_resp.raise_for_status()
            discovery = discovery_resp.json()

            jwks_resp = await client.get(discovery["jwks_uri"])
            jwks_resp.raise_for_status()
            jwks = jwks_resp.json()

        # JWKS로 토큰 검증
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=settings.oidc_client_id,
        )
        return payload
    except Exception:
        return None
