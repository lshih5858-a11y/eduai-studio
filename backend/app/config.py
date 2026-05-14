"""애플리케이션 설정 관리 모듈.

환경 변수 기반 설정을 Pydantic Settings를 통해 관리합니다.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """애플리케이션 설정 클래스."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # 앱 기본 설정
    app_name: str = "U-AI Compass"
    app_version: str = "1.0.0"
    debug: bool = False
    allowed_origins: str = "http://localhost:3000"

    # 데이터베이스 설정
    database_url: str = "postgresql+asyncpg://uai:uai_password@localhost:5432/uai_compass"
    pii_database_schema: str = "pii"

    # Redis 설정
    redis_url: str = "redis://localhost:6379/0"

    # Kafka 설정
    kafka_bootstrap_servers: str = "localhost:9092"

    # JWT 설정
    jwt_secret_key: str = "change-this-to-a-secure-random-string-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # OIDC 설정
    oidc_provider_url: str = "https://sso.university.ac.kr"
    oidc_client_id: str = "uai-compass-client"
    oidc_client_secret: str = "change-this-secret"

    # 가명화 설정
    pseudonym_salt: str = "change-this-salt-in-production"

    # MinIO 설정
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"

    # OpenTelemetry 설정
    otel_exporter_otlp_endpoint: str = "http://localhost:4317"
    otel_service_name: str = "uai-compass-backend"

    @property
    def allowed_origins_list(self) -> List[str]:
        """허용된 CORS 오리진 목록을 반환합니다."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """설정 싱글톤 인스턴스를 반환합니다."""
    return Settings()
