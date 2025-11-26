"""Abstract database adapter interface."""

from abc import ABC, abstractmethod
from typing import Any


class DatabaseAdapter(ABC):
    """Abstract interface for database operations.

    Implementations:
    - SQLiteAdapter: For local development and testing
    - SupabaseAdapter: For production deployment
    """

    @abstractmethod
    async def connect(self) -> None:
        """Establish database connection."""
        ...

    @abstractmethod
    async def disconnect(self) -> None:
        """Close database connection."""
        ...

    @abstractmethod
    async def execute(self, sql: str, params: tuple | None = None) -> None:
        """Execute a single SQL statement.

        Args:
            sql: SQL statement to execute
            params: Optional parameters for parameterized queries
        """
        ...

    @abstractmethod
    async def execute_many(self, sql: str, params_list: list[tuple]) -> None:
        """Execute a SQL statement with multiple parameter sets.

        Args:
            sql: SQL statement to execute
            params_list: List of parameter tuples
        """
        ...

    @abstractmethod
    async def executescript(self, sql: str) -> None:
        """Execute multiple SQL statements as a script.

        Args:
            sql: SQL script containing multiple statements
        """
        ...

    @abstractmethod
    async def fetch_one(self, sql: str, params: tuple | None = None) -> dict[str, Any] | None:
        """Fetch a single row as a dictionary.

        Args:
            sql: SQL query to execute
            params: Optional parameters for parameterized queries

        Returns:
            Row as dictionary or None if no results
        """
        ...

    @abstractmethod
    async def fetch_all(self, sql: str, params: tuple | None = None) -> list[dict[str, Any]]:
        """Fetch all rows as a list of dictionaries.

        Args:
            sql: SQL query to execute
            params: Optional parameters for parameterized queries

        Returns:
            List of rows as dictionaries
        """
        ...

    @abstractmethod
    async def table_exists(self, table_name: str) -> bool:
        """Check if a table exists in the database.

        Args:
            table_name: Name of the table to check

        Returns:
            True if table exists, False otherwise
        """
        ...
