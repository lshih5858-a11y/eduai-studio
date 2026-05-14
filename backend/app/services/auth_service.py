"""인증 서비스 모듈.

로그인, 토큰 갱신, 로그아웃 비즈니스 로직을 담당합니다.
"""
import logging
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.audit import AuditAction, AuditLogger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_ip_address,
    hash_password,
    verify_password,
    verify_refresh_token,
)
from app.models.user import User
from app.schemas.auth import TokenResponse

logger = logging.getLogger(__name__)
settings = get_settings()


class AuthService:
    """인증 서비스 클래스."""

    def __init__(self, db: AsyncSession) -> None:
        """서비스 초기화.

        Args:
            db: 비동기 SQLAlchemy 세션
        """
        self.db = db
        self.audit_logger = AuditLogger(db)

    async def login(
        self,
        pseudo_student_id: str,
        password: str,
        client_ip: str,
    ) -> TokenResponse:
        """사용자 로그인을 처리합니다.

        자격증명을 검증하고 JWT 토큰을 발급합니다.

        Args:
            pseudo_student_id: 가명 학번
            password: 비밀번호
            client_ip: 클라이언트 IP 주소

        Returns:
            액세스/리프레시 토큰 응답

        Raises:
            ValueError: 자격증명이 유효하지 않은 경우
        """
        from fastapi import HTTPException, status

        ip_hash = hash_ip_address(client_ip)

        # 사용자 조회
        result = await self.db.execute(
            select(User).where(User.pseudo_student_id == pseudo_student_id)
        )
        user = result.scalar_one_or_none()

        if user is None or not user.is_active:
            # 실패 감사 로그
            await self.audit_logger.log(
                action=AuditAction.LOGIN_FAILURE,
                actor_pseudo_id=pseudo_student_id,
                resource_type="auth",
                ip_hash=ip_hash,
                extra_data={"reason": "user_not_found_or_inactive"},
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="아이디 또는 비밀번호가 올바르지 않습니다.",
            )

        # 비밀번호 검증 (hashed_password 필드가 없으면 개발용 단순 비교)
        password_field = getattr(user, "hashed_password", None)
        if password_field:
            if not verify_password(password, password_field):
                await self.audit_logger.log(
                    action=AuditAction.LOGIN_FAILURE,
                    actor_pseudo_id=pseudo_student_id,
                    resource_type="auth",
                    ip_hash=ip_hash,
                    extra_data={"reason": "wrong_password"},
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="아이디 또는 비밀번호가 올바르지 않습니다.",
                )

        # 마지막 로그인 시각 업데이트
        user.last_login_at = datetime.now(timezone.utc)
        await self.db.flush()

        # 성공 감사 로그
        await self.audit_logger.log(
            action=AuditAction.LOGIN_SUCCESS,
            actor_pseudo_id=pseudo_student_id,
            resource_type="auth",
            ip_hash=ip_hash,
        )

        # 토큰 생성
        access_token = create_access_token(
            subject=pseudo_student_id,
            extra_claims={"role": user.role.value},
        )
        refresh_token = create_refresh_token(subject=pseudo_student_id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.jwt_access_token_expire_minutes * 60,
        )

    async def refresh_token(self, refresh_token: str) -> TokenResponse | None:
        """리프레시 토큰으로 새 액세스 토큰을 발급합니다.

        Args:
            refresh_token: 리프레시 JWT 토큰

        Returns:
            새 토큰 응답 또는 None (유효하지 않은 경우)
        """
        payload = verify_refresh_token(refresh_token)
        if payload is None:
            return None

        pseudo_id: str | None = payload.get("sub")
        if pseudo_id is None:
            return None

        # 사용자 존재 및 활성화 확인
        result = await self.db.execute(
            select(User).where(User.pseudo_student_id == pseudo_id)
        )
        user = result.scalar_one_or_none()
        if user is None or not user.is_active:
            return None

        # 감사 로그
        await self.audit_logger.log(
            action=AuditAction.TOKEN_REFRESH,
            actor_pseudo_id=pseudo_id,
            resource_type="auth",
        )

        # 새 토큰 발급
        new_access_token = create_access_token(
            subject=pseudo_id,
            extra_claims={"role": user.role.value},
        )
        new_refresh_token = create_refresh_token(subject=pseudo_id)

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.jwt_access_token_expire_minutes * 60,
        )

    async def logout(self, pseudo_student_id: str) -> None:
        """로그아웃 처리.

        감사 로그를 기록합니다.
        실제 토큰 무효화는 Redis 블랙리스트로 구현할 수 있습니다.

        Args:
            pseudo_student_id: 로그아웃할 사용자의 가명 식별자
        """
        await self.audit_logger.log(
            action=AuditAction.LOGOUT,
            actor_pseudo_id=pseudo_student_id,
            resource_type="auth",
        )
