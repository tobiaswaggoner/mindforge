"""Supabase database adapter implementation (stub).

This is a placeholder for the production Supabase adapter.
Will be implemented when deploying to production.
"""

from typing import Any

from .adapter import DatabaseAdapter


class SupabaseAdapter(DatabaseAdapter):
    """Supabase implementation of DatabaseAdapter.

    TODO: Implement using supabase-py when deploying to production.
    """

    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize Supabase adapter.

        Args:
            supabase_url: Supabase project URL
            supabase_key: Supabase API key
        """
        self._url = supabase_url
        self._key = supabase_key
        raise NotImplementedError(
            "SupabaseAdapter is not yet implemented. "
            "Use SQLiteAdapter for development."
        )

    async def connect(self) -> None:
        """Establish database connection."""
        raise NotImplementedError("SupabaseAdapter.connect() not implemented")

    async def disconnect(self) -> None:
        """Close database connection."""
        raise NotImplementedError("SupabaseAdapter.disconnect() not implemented")

    async def execute(self, sql: str, params: tuple | None = None) -> None:
        """Execute a single SQL statement."""
        raise NotImplementedError("SupabaseAdapter.execute() not implemented")

    async def execute_many(self, sql: str, params_list: list[tuple]) -> None:
        """Execute a SQL statement with multiple parameter sets."""
        raise NotImplementedError("SupabaseAdapter.execute_many() not implemented")

    async def executescript(self, sql: str) -> None:
        """Execute multiple SQL statements as a script."""
        raise NotImplementedError("SupabaseAdapter.executescript() not implemented")

    async def fetch_one(self, sql: str, params: tuple | None = None) -> dict[str, Any] | None:
        """Fetch a single row as a dictionary."""
        raise NotImplementedError("SupabaseAdapter.fetch_one() not implemented")

    async def fetch_all(self, sql: str, params: tuple | None = None) -> list[dict[str, Any]]:
        """Fetch all rows as a list of dictionaries."""
        raise NotImplementedError("SupabaseAdapter.fetch_all() not implemented")

    async def table_exists(self, table_name: str) -> bool:
        """Check if a table exists in the database."""
        raise NotImplementedError("SupabaseAdapter.table_exists() not implemented")
