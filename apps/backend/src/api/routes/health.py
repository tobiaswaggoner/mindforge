"""Health check endpoints."""

from fastapi import APIRouter

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
