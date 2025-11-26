"""Migration management API routes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...db import SQLiteAdapter
from ...db.migrations import MigrationRunner
from ...config import settings

router = APIRouter(prefix="/migrations", tags=["migrations"])


class MigrationStatusResponse(BaseModel):
    """Response model for migration status."""

    applied: list[str]
    pending: list[str]


class MigrationRunResponse(BaseModel):
    """Response model for migration run."""

    applied: list[str]
    message: str


class AppliedMigration(BaseModel):
    """Single applied migration with timestamp."""

    name: str
    applied_at: str


class MigrationHistoryResponse(BaseModel):
    """Response model for migration history."""

    migrations: list[AppliedMigration]


def _get_database_path() -> str:
    """Extract SQLite database path from connection URL."""
    url = settings.database_url
    if url.startswith("sqlite+aiosqlite:///"):
        return url.replace("sqlite+aiosqlite:///", "")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "")
    raise ValueError(f"Unsupported database URL: {url}")


@router.get("/status", response_model=MigrationStatusResponse)
async def get_migration_status() -> MigrationStatusResponse:
    """Get current migration status.

    Returns list of applied and pending migrations.
    """
    adapter = SQLiteAdapter(_get_database_path())
    try:
        await adapter.connect()
        runner = MigrationRunner(adapter)
        status = await runner.get_status()
        return MigrationStatusResponse(
            applied=status.applied,
            pending=status.pending,
        )
    finally:
        await adapter.disconnect()


@router.post("/run", response_model=MigrationRunResponse)
async def run_migrations() -> MigrationRunResponse:
    """Run all pending migrations.

    This endpoint should be called explicitly to apply database changes.
    Migrations are NOT run automatically on application start.
    """
    adapter = SQLiteAdapter(_get_database_path())
    try:
        await adapter.connect()
        runner = MigrationRunner(adapter)
        applied = await runner.run_pending()

        if applied:
            message = f"Successfully applied {len(applied)} migration(s)"
        else:
            message = "No pending migrations"

        return MigrationRunResponse(applied=applied, message=message)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Migration failed: {str(e)}",
        )
    finally:
        await adapter.disconnect()


@router.get("/history", response_model=MigrationHistoryResponse)
async def get_migration_history() -> MigrationHistoryResponse:
    """Get history of applied migrations with timestamps."""
    adapter = SQLiteAdapter(_get_database_path())
    try:
        await adapter.connect()

        # Check if migrations table exists
        if not await adapter.table_exists("_migrations"):
            return MigrationHistoryResponse(migrations=[])

        rows = await adapter.fetch_all(
            "SELECT name, applied_at FROM _migrations ORDER BY applied_at"
        )
        migrations = [
            AppliedMigration(name=row["name"], applied_at=row["applied_at"])
            for row in rows
        ]
        return MigrationHistoryResponse(migrations=migrations)
    finally:
        await adapter.disconnect()
