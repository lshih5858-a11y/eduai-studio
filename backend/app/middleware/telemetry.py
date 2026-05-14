"""OpenTelemetry 설정 모듈.

분산 추적(distributed tracing) 설정을 담당합니다.
"""
import logging

from fastapi import FastAPI

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def setup_telemetry(app: FastAPI) -> None:
    """OpenTelemetry 트레이싱을 설정합니다.

    OTEL SDK가 설치된 경우 자동 계측을 활성화합니다.
    설치되지 않은 경우 경고 로그만 출력합니다.

    Args:
        app: FastAPI 애플리케이션 인스턴스
    """
    try:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor

        # 리소스 설정
        resource = Resource.create(
            {
                "service.name": settings.otel_service_name,
                "service.version": settings.app_version,
                "deployment.environment": "production" if not settings.debug else "development",
            }
        )

        # TracerProvider 설정
        tracer_provider = TracerProvider(resource=resource)

        # OTLP 익스포터 설정
        otlp_exporter = OTLPSpanExporter(
            endpoint=settings.otel_exporter_otlp_endpoint,
        )
        tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))

        # 전역 TracerProvider 등록
        trace.set_tracer_provider(tracer_provider)

        # FastAPI 자동 계측
        FastAPIInstrumentor.instrument_app(app, tracer_provider=tracer_provider)

        # SQLAlchemy 자동 계측
        SQLAlchemyInstrumentor().instrument(tracer_provider=tracer_provider)

        logger.info(
            f"OpenTelemetry 트레이싱 활성화: endpoint={settings.otel_exporter_otlp_endpoint}"
        )

    except ImportError:
        logger.warning(
            "OpenTelemetry SDK가 설치되지 않았습니다. 트레이싱이 비활성화됩니다. "
            "설치: pip install opentelemetry-sdk opentelemetry-instrumentation-fastapi"
        )
    except Exception as exc:
        logger.error(f"OpenTelemetry 설정 중 오류 발생: {exc}")
