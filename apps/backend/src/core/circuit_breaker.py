"""Generic Circuit Breaker implementation for protecting external service calls."""

import asyncio
import time
import logging
from enum import Enum
from dataclasses import dataclass, field
from typing import Callable, TypeVar, ParamSpec, Any
from functools import wraps

logger = logging.getLogger(__name__)

P = ParamSpec("P")
T = TypeVar("T")


class CircuitState(str, Enum):
    """State of the circuit breaker."""
    CLOSED = "closed"       # Normal operation - requests flow through
    OPEN = "open"           # Blocking calls - fail fast
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Configuration for a circuit breaker."""
    name: str
    failure_threshold: int = 5       # Failures before opening
    success_threshold: int = 2       # Successes in half-open before closing
    timeout_seconds: float = 60.0    # Time in open state before half-open
    excluded_exceptions: tuple = ()  # Exceptions that don't count as failures


@dataclass
class CircuitBreakerState:
    """Runtime state of a circuit breaker."""
    state: CircuitState = CircuitState.CLOSED
    failure_count: int = 0
    success_count: int = 0
    last_failure_time: float | None = None
    last_state_change: float = field(default_factory=time.time)


class CircuitOpenError(Exception):
    """Raised when circuit breaker is open and blocking calls."""

    def __init__(self, name: str, retry_after: float | None = None):
        self.name = name
        self.retry_after = retry_after
        super().__init__(f"Circuit breaker '{name}' is open")


class CircuitBreaker:
    """Generic circuit breaker for protecting external service calls.

    The circuit breaker pattern prevents cascading failures by failing fast
    when a service is unavailable, rather than waiting for timeouts.

    States:
    - CLOSED: Normal operation, requests pass through
    - OPEN: Service is failing, requests are blocked immediately
    - HALF_OPEN: Testing if service recovered, limited requests allowed

    Usage as decorator:
        llm_breaker = CircuitBreaker(CircuitBreakerConfig(name="llm"))

        @llm_breaker
        async def call_llm(prompt: str) -> str:
            return await openai.complete(prompt)

    Usage with call():
        result = await llm_breaker.call(some_async_func, arg1, arg2)

    Usage with protect() context manager:
        async with llm_breaker.protect():
            result = await some_external_call()
    """

    # Global registry of all circuit breakers
    _registry: dict[str, "CircuitBreaker"] = {}

    def __init__(self, config: CircuitBreakerConfig):
        """Initialize circuit breaker.

        Args:
            config: Circuit breaker configuration
        """
        self.config = config
        self._state = CircuitBreakerState()
        self._lock = asyncio.Lock()

        # Register globally
        CircuitBreaker._registry[config.name] = self
        logger.info(f"Circuit breaker '{config.name}' initialized")

    @classmethod
    def get(cls, name: str) -> "CircuitBreaker | None":
        """Get circuit breaker by name."""
        return cls._registry.get(name)

    @classmethod
    def get_all_status(cls) -> dict[str, dict]:
        """Get status of all circuit breakers."""
        return {
            name: breaker.get_status()
            for name, breaker in cls._registry.items()
        }

    @property
    def state(self) -> CircuitState:
        """Get current circuit state."""
        return self._state.state

    @property
    def is_open(self) -> bool:
        """Check if circuit is open (blocking calls)."""
        return self._state.state == CircuitState.OPEN

    @property
    def is_closed(self) -> bool:
        """Check if circuit is closed (normal operation)."""
        return self._state.state == CircuitState.CLOSED

    def get_status(self) -> dict:
        """Get current status for API response."""
        retry_after = None
        if self._state.state == CircuitState.OPEN and self._state.last_failure_time:
            elapsed = time.time() - self._state.last_failure_time
            remaining = self.config.timeout_seconds - elapsed
            retry_after = max(0, remaining)

        return {
            "name": self.config.name,
            "state": self._state.state.value,
            "failure_count": self._state.failure_count,
            "success_count": self._state.success_count,
            "retry_after_seconds": retry_after,
            "last_state_change": self._state.last_state_change,
        }

    async def _check_state(self) -> None:
        """Check and potentially transition state based on timeout."""
        async with self._lock:
            if self._state.state == CircuitState.OPEN:
                # Check if timeout has passed
                if self._state.last_failure_time:
                    elapsed = time.time() - self._state.last_failure_time
                    if elapsed >= self.config.timeout_seconds:
                        logger.info(
                            f"Circuit '{self.config.name}' transitioning "
                            f"OPEN -> HALF_OPEN (timeout elapsed)"
                        )
                        self._state.state = CircuitState.HALF_OPEN
                        self._state.success_count = 0
                        self._state.last_state_change = time.time()

    async def record_success(self) -> None:
        """Record a successful call."""
        async with self._lock:
            if self._state.state == CircuitState.HALF_OPEN:
                self._state.success_count += 1
                if self._state.success_count >= self.config.success_threshold:
                    logger.info(
                        f"Circuit '{self.config.name}' transitioning "
                        f"HALF_OPEN -> CLOSED (success threshold reached)"
                    )
                    self._state.state = CircuitState.CLOSED
                    self._state.failure_count = 0
                    self._state.success_count = 0
                    self._state.last_state_change = time.time()
            elif self._state.state == CircuitState.CLOSED:
                # Reset failure count on success
                self._state.failure_count = 0

    async def record_failure(self, exception: Exception) -> None:
        """Record a failed call."""
        # Check if this exception should be excluded
        if isinstance(exception, self.config.excluded_exceptions):
            logger.debug(
                f"Circuit '{self.config.name}' ignoring excluded exception: "
                f"{type(exception).__name__}"
            )
            return

        async with self._lock:
            self._state.failure_count += 1
            self._state.last_failure_time = time.time()

            if self._state.state == CircuitState.HALF_OPEN:
                # Any failure in half-open goes back to open
                logger.warning(
                    f"Circuit '{self.config.name}' transitioning "
                    f"HALF_OPEN -> OPEN (failure in half-open)"
                )
                self._state.state = CircuitState.OPEN
                self._state.last_state_change = time.time()

            elif self._state.state == CircuitState.CLOSED:
                if self._state.failure_count >= self.config.failure_threshold:
                    logger.warning(
                        f"Circuit '{self.config.name}' transitioning "
                        f"CLOSED -> OPEN (failure threshold {self.config.failure_threshold} reached)"
                    )
                    self._state.state = CircuitState.OPEN
                    self._state.last_state_change = time.time()

    async def call(
        self,
        func: Callable[P, T],
        *args: P.args,
        **kwargs: P.kwargs
    ) -> T:
        """Execute a function with circuit breaker protection.

        Args:
            func: Async function to execute
            *args: Positional arguments for func
            **kwargs: Keyword arguments for func

        Returns:
            Result of func

        Raises:
            CircuitOpenError: If circuit is open
            Exception: If func raises an exception
        """
        await self._check_state()

        if self._state.state == CircuitState.OPEN:
            retry_after = None
            if self._state.last_failure_time:
                retry_after = self.config.timeout_seconds - (
                    time.time() - self._state.last_failure_time
                )
            raise CircuitOpenError(self.config.name, retry_after)

        try:
            result = await func(*args, **kwargs)
            await self.record_success()
            return result
        except Exception as e:
            await self.record_failure(e)
            raise

    def __call__(
        self,
        func: Callable[P, T]
    ) -> Callable[P, T]:
        """Use circuit breaker as decorator.

        Example:
            @circuit_breaker
            async def my_func():
                ...
        """
        @wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            return await self.call(func, *args, **kwargs)
        return wrapper

    class _ProtectContext:
        """Context manager for circuit breaker protection."""

        def __init__(self, breaker: "CircuitBreaker"):
            self._breaker = breaker

        async def __aenter__(self) -> "CircuitBreaker._ProtectContext":
            await self._breaker._check_state()
            if self._breaker._state.state == CircuitState.OPEN:
                retry_after = None
                if self._breaker._state.last_failure_time:
                    retry_after = self._breaker.config.timeout_seconds - (
                        time.time() - self._breaker._state.last_failure_time
                    )
                raise CircuitOpenError(self._breaker.config.name, retry_after)
            return self

        async def __aexit__(self, exc_type, exc_val, exc_tb) -> bool:
            if exc_val is None:
                await self._breaker.record_success()
            else:
                await self._breaker.record_failure(exc_val)
            return False  # Don't suppress exceptions

    def protect(self) -> _ProtectContext:
        """Get a context manager for circuit breaker protection.

        Example:
            async with circuit_breaker.protect():
                result = await external_call()
        """
        return self._ProtectContext(self)

    def reset(self) -> None:
        """Manually reset the circuit breaker to closed state.

        Use for testing or administrative override.
        """
        self._state = CircuitBreakerState()
        logger.info(f"Circuit '{self.config.name}' manually reset to CLOSED")
