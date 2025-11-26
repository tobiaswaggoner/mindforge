"""SQLite database adapter implementation."""

import aiosqlite
from typing import Any

from .adapter import DatabaseAdapter


class SQLiteAdapter(DatabaseAdapter):
    """SQLite implementation of DatabaseAdapter.

    Uses aiosqlite for async SQLite operations.
    Suitable for local development and testing.
    """

    def __init__(self, database_path: str):
        """Initialize SQLite adapter.

        Args:
            database_path: Path to SQLite database file, or ':memory:' for in-memory
        """
        self._database_path = database_path
        self._connection: aiosqlite.Connection | None = None

    async def connect(self) -> None:
        """Establish database connection."""
        if self._connection is None:
            self._connection = await aiosqlite.connect(self._database_path)
            self._connection.row_factory = aiosqlite.Row
            await self._connection.execute("PRAGMA foreign_keys = ON")

    async def disconnect(self) -> None:
        """Close database connection."""
        if self._connection is not None:
            await self._connection.close()
            self._connection = None

    def _ensure_connected(self) -> aiosqlite.Connection:
        """Ensure connection is established."""
        if self._connection is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self._connection

    async def execute(self, sql: str, params: tuple | None = None) -> None:
        """Execute a single SQL statement."""
        conn = self._ensure_connected()
        if params:
            await conn.execute(sql, params)
        else:
            await conn.execute(sql)
        await conn.commit()

    async def execute_many(self, sql: str, params_list: list[tuple]) -> None:
        """Execute a SQL statement with multiple parameter sets."""
        conn = self._ensure_connected()
        await conn.executemany(sql, params_list)
        await conn.commit()

    async def executescript(self, sql: str) -> None:
        """Execute multiple SQL statements as a script."""
        conn = self._ensure_connected()
        await conn.executescript(sql)
        await conn.commit()

    async def fetch_one(self, sql: str, params: tuple | None = None) -> dict[str, Any] | None:
        """Fetch a single row as a dictionary."""
        conn = self._ensure_connected()
        if params:
            cursor = await conn.execute(sql, params)
        else:
            cursor = await conn.execute(sql)
        row = await cursor.fetchone()
        if row is None:
            return None
        return dict(row)

    async def fetch_all(self, sql: str, params: tuple | None = None) -> list[dict[str, Any]]:
        """Fetch all rows as a list of dictionaries."""
        conn = self._ensure_connected()
        if params:
            cursor = await conn.execute(sql, params)
        else:
            cursor = await conn.execute(sql)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

    async def table_exists(self, table_name: str) -> bool:
        """Check if a table exists in the database."""
        result = await self.fetch_one(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            (table_name,),
        )
        return result is not None
