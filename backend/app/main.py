"""U-AI Compass FastAPI 애플리케이션 팩토리.

앱 초기화, 미들웨어 설정, 라우터 등록을 담당합니다.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1.router import api_v1_router
from app.config import get_settings
from app.database import close_db, init_db
from app.middleware.audit_middleware import AuditMiddleware
from app.middleware.telemetry import setup_telemetry

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """애플리케이션 생명주기 관리.

    시작 시 DB 초기화, 종료 시 리소스 정리를 수행합니다.
    """
    # 시작 시 초기화
    await init_db()
    setup_telemetry(app)

    yield

    # 종료 시 정리
    await close_db()


def create_app() -> FastAPI:
    """FastAPI 애플리케이션 인스턴스를 생성합니다."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="한국 대학교용 학습 분석 플랫폼 API",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan,
    )

    # CORS 미들웨어 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 신뢰할 수 있는 호스트 미들웨어
    if not settings.debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["*.university.ac.kr", "localhost"],
        )

    # 감사 미들웨어 등록
    app.add_middleware(AuditMiddleware)

    # API v1 라우터 등록
    app.include_router(api_v1_router, prefix="/api/v1")

    @app.get("/health")
    async def health_check() -> dict:
        """서비스 상태 확인 엔드포인트."""
        return {"status": "healthy", "version": settings.app_version}

    return app


app = create_app()
