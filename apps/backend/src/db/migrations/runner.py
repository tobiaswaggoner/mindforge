"""Migration runner for database schema management."""

import importlib
import pkgutil
from dataclasses import dataclass
from datetime import datetime
from typing import Callable, Awaitable

from ..adapter import DatabaseAdapter


@dataclass
class Migration:
    """Represents a database migration."""

    name: str
    up: Callable[[DatabaseAdapter], Awaitable[None]]


@dataclass
class MigrationStatus:
    """Status of migrations."""

    applied: list[str]
    pending: list[str]


class MigrationRunner:
    """Handles database migration discovery and execution.

    Migrations are tracked in a `_migrations` table.
    Each migration is a Python module in the `versions` package with:
    - NAME: str - Unique migration identifier
    - up(adapter): async function - Migration logic
    """

    MIGRATIONS_TABLE = "_migrations"

    def __init__(self, adapter: DatabaseAdapter):
        """Initialize migration runner.

        Args:
            adapter: Database adapter to use for migrations
        """
        self._adapter = adapter
        self._migrations: list[Migration] = []

    async def initialize(self) -> None:
        """Create migrations tracking table if it doesn't exist."""
        await self._adapter.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.MIGRATIONS_TABLE} (
                name TEXT PRIMARY KEY,
                applied_at TEXT DEFAULT (datetime('now'))
            )
        """)

    def discover_migrations(self) -> list[Migration]:
        """Discover all migrations from the versions package.

        Returns:
            List of Migration objects sorted by name
        """
        from . import versions

        migrations = []

        for importer, modname, ispkg in pkgutil.iter_modules(versions.__path__):
            if not ispkg and modname.startswith("m"):
                module = importlib.import_module(f".versions.{modname}", package=__package__)
                if hasattr(module, "NAME") and hasattr(module, "up"):
                    migrations.append(
                        Migration(name=module.NAME, up=module.up)
                    )

        # Sort by name (m001, m002, etc.)
        migrations.sort(key=lambda m: m.name)
        self._migrations = migrations
        return migrations

    async def get_applied_migrations(self) -> list[str]:
        """Get list of already applied migration names.

        Returns:
            List of applied migration names
        """
        rows = await self._adapter.fetch_all(
            f"SELECT name FROM {self.MIGRATIONS_TABLE} ORDER BY name"
        )
        return [row["name"] for row in rows]

    async def get_status(self) -> MigrationStatus:
        """Get current migration status.

        Returns:
            MigrationStatus with applied and pending migrations
        """
        await self.initialize()
        self.discover_migrations()

        applied = await self.get_applied_migrations()
        all_names = [m.name for m in self._migrations]
        pending = [name for name in all_names if name not in applied]

        return MigrationStatus(applied=applied, pending=pending)

    async def run_pending(self) -> list[str]:
        """Run all pending migrations.

        Returns:
            List of newly applied migration names
        """
        await self.initialize()
        self.discover_migrations()

        applied = await self.get_applied_migrations()
        newly_applied = []

        for migration in self._migrations:
            if migration.name not in applied:
                await self._run_migration(migration)
                newly_applied.append(migration.name)

        return newly_applied

    async def _run_migration(self, migration: Migration) -> None:
        """Run a single migration and record it.

        Args:
            migration: Migration to run
        """
        # Run the migration
        await migration.up(self._adapter)

        # Record it as applied
        await self._adapter.execute(
            f"INSERT INTO {self.MIGRATIONS_TABLE} (name, applied_at) VALUES (?, ?)",
            (migration.name, datetime.utcnow().isoformat()),
        )
