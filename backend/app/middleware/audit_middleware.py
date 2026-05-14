"""감사 미들웨어 모듈.

민감한 엔드포인트에 대한 요청 수준 감사 로그를 기록합니다.
"""
import hashlib
import time
from datetime import datetime, timezone
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.config import get_settings

settings = get_settings()

# 감사 로그가 필요한 민감 엔드포인트 경로 패턴
SENSITIVE_PATHS = {
    "/api/v1/analytics",
    "/api/v1/users",
    "/api/v1/consent",
    "/api/v1/interventions",
}


class AuditMiddleware(BaseHTTPMiddleware):
    """요청 수준 감사 미들웨어.

    민감한 엔드포인트에 대한 모든 요청을 기록합니다.
    """

    def __init__(self, app: ASGIApp) -> None:
        """미들웨어 초기화."""
        super().__init__(app)

    async def dispatch(self, request: Request, call_next) -> Response:
        """요청을 처리하고 감사 정보를 기록합니다.

        Args:
            request: 들어온 HTTP 요청
            call_next: 다음 미들웨어/라우터 핸들러

        Returns:
            HTTP 응답
        """
        start_time = time.monotonic()

        # 요청 메타데이터 추출
        path = request.url.path
        method = request.method
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "")

        # IP 및 User-Agent 해싱
        ip_hash = hashlib.sha256(
            f"{client_ip}{settings.pseudonym_salt}".encode()
        ).hexdigest()
        ua_hash = hashlib.sha256(user_agent.encode()).hexdigest()

        # 응답 처리
        response = await call_next(request)

        # 민감 경로에만 미들웨어 레벨 로깅
        is_sensitive = any(path.startswith(p) for p in SENSITIVE_PATHS)
        if is_sensitive:
            elapsed_ms = int((time.monotonic() - start_time) * 1000)

            # 응답 헤더에 요청 추적 ID 추가
            request_id = str(uuid4())
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{elapsed_ms}ms"

            # 구조화 로그 출력 (프로덕션에서는 로그 집계 시스템으로 전송)
            import logging

            logger = logging.getLogger("audit.middleware")
            logger.info(
                "AUDIT_REQUEST",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "status_code": response.status_code,
                    "ip_hash": ip_hash,
                    "ua_hash": ua_hash,
                    "elapsed_ms": elapsed_ms,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )

        return response
