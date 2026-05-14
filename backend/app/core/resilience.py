"""탄력성 패턴 모듈.

외부 서비스 호출을 위한 재시도(Retry) 및 서킷 브레이커(Circuit Breaker) 데코레이터를 제공합니다.
"""
import asyncio
import enum
import functools
import logging
import time
from typing import Any, Callable, Type, TypeVar

logger = logging.getLogger(__name__)

F = TypeVar("F", bound=Callable[..., Any])


def retry(
    max_attempts: int = 3,
    delay_seconds: float = 1.0,
    backoff_factor: float = 2.0,
    exceptions: tuple[Type[Exception], ...] = (Exception,),
) -> Callable[[F], F]:
    """재시도 데코레이터.

    지수 백오프(exponential backoff) 전략으로 재시도합니다.

    Args:
        max_attempts: 최대 시도 횟수
        delay_seconds: 초기 대기 시간(초)
        backoff_factor: 백오프 배수
        exceptions: 재시도할 예외 타입들

    Returns:
        데코레이터 함수
    """

    def decorator(func: F) -> F:
        @functools.wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            last_exception: Exception | None = None
            current_delay = delay_seconds

            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as exc:
                    last_exception = exc
                    if attempt == max_attempts:
                        logger.error(
                            f"함수 {func.__name__} 최대 재시도 횟수({max_attempts}) 초과: {exc}"
                        )
                        raise
                    logger.warning(
                        f"함수 {func.__name__} 시도 {attempt}/{max_attempts} 실패: {exc}. "
                        f"{current_delay:.1f}초 후 재시도..."
                    )
                    await asyncio.sleep(current_delay)
                    current_delay *= backoff_factor

            # 도달하지 않아야 하는 코드 경로
            if last_exception:
                raise last_exception
            return None

        return async_wrapper  # type: ignore[return-value]

    return decorator


class CircuitState(str, enum.Enum):
    """서킷 브레이커 상태 열거형."""

    CLOSED = "CLOSED"    # 정상 상태
    OPEN = "OPEN"        # 차단 상태
    HALF_OPEN = "HALF_OPEN"  # 복구 시도 상태


class CircuitBreaker:
    """서킷 브레이커 구현 클래스.

    외부 서비스 장애 시 fast-fail로 시스템을 보호합니다.
    """

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        success_threshold: int = 2,
        name: str = "default",
    ) -> None:
        """서킷 브레이커 초기화.

        Args:
            failure_threshold: OPEN 상태로 전환하는 실패 횟수 임계값
            recovery_timeout: OPEN 후 HALF_OPEN으로 전환되는 시간(초)
            success_threshold: HALF_OPEN에서 CLOSED로 전환되는 성공 횟수
            name: 서킷 브레이커 이름 (로깅용)
        """
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        self.name = name

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: float | None = None

    def _should_attempt(self) -> bool:
        """현재 상태에서 요청 시도 가능 여부를 반환합니다."""
        if self.state == CircuitState.CLOSED:
            return True
        if self.state == CircuitState.OPEN:
            if self.last_failure_time and (
                time.monotonic() - self.last_failure_time >= self.recovery_timeout
            ):
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
                logger.info(f"서킷 브레이커 [{self.name}] HALF_OPEN 상태로 전환")
                return True
            return False
        # HALF_OPEN
        return True

    def record_success(self) -> None:
        """성공을 기록하고 상태를 업데이트합니다."""
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
                logger.info(f"서킷 브레이커 [{self.name}] CLOSED 상태로 복구")
        elif self.state == CircuitState.CLOSED:
            self.failure_count = max(0, self.failure_count - 1)

    def record_failure(self) -> None:
        """실패를 기록하고 상태를 업데이트합니다."""
        self.failure_count += 1
        self.last_failure_time = time.monotonic()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logger.error(
                f"서킷 브레이커 [{self.name}] OPEN 상태로 전환 "
                f"(실패 횟수: {self.failure_count})"
            )

    def __call__(self, func: F) -> F:
        """함수에 서킷 브레이커를 적용하는 데코레이터."""

        @functools.wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            if not self._should_attempt():
                raise RuntimeError(
                    f"서킷 브레이커 [{self.name}] OPEN 상태: 요청 차단됨"
                )
            try:
                result = await func(*args, **kwargs)
                self.record_success()
                return result
            except Exception as exc:
                self.record_failure()
                raise

        return wrapper  # type: ignore[return-value]


# 전역 서킷 브레이커 인스턴스
_circuit_breakers: dict[str, CircuitBreaker] = {}


def circuit_breaker(
    name: str,
    failure_threshold: int = 5,
    recovery_timeout: float = 60.0,
) -> Callable[[F], F]:
    """서킷 브레이커 데코레이터 팩토리.

    전역 서킷 브레이커 레지스트리를 사용합니다.

    Args:
        name: 서킷 브레이커 이름 (공유)
        failure_threshold: 실패 임계값
        recovery_timeout: 복구 대기 시간(초)

    Returns:
        데코레이터 함수
    """
    if name not in _circuit_breakers:
        _circuit_breakers[name] = CircuitBreaker(
            failure_threshold=failure_threshold,
            recovery_timeout=recovery_timeout,
            name=name,
        )
    return _circuit_breakers[name]
