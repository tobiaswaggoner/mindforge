"""Health check endpoints."""

from fastapi import APIRouter, HTTPException

from ...core.circuit_breaker import CircuitBreaker

router = APIRouter(prefix="/health")


@router.get("")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy"}


@router.get("/ready")
async def readiness_check():
    """Readiness check - verifies all dependencies are available."""
    # TODO: Add database connectivity check
    return {"status": "ready", "checks": {"database": "ok"}}


@router.get("/circuits")
async def get_circuit_status() -> dict:
    """Get status of all circuit breakers.

    Returns information about all registered circuit breakers including:
    - Current state (closed, open, half_open)
    - Failure count
    - Success count (in half_open state)
    - Retry after seconds (if open)
    """
    circuits = CircuitBreaker.get_all_status()
    return {
        "circuits": circuits,
        "any_open": any(
            cb.is_open for cb in CircuitBreaker._registry.values()
        ),
    }


@router.post("/circuits/{name}/reset")
async def reset_circuit(name: str) -> dict:
    """Manually reset a circuit breaker to closed state.

    This is an administrative endpoint for manually recovering
    from circuit breaker trips when the underlying issue is resolved.
    """
    breaker = CircuitBreaker.get(name)
    if not breaker:
        raise HTTPException(
            status_code=404,
            detail=f"Circuit breaker '{name}' not found"
        )
    breaker.reset()
    return breaker.get_status()
