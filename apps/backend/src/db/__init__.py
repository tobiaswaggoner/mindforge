"""Database abstraction layer for MindForge.

Provides a unified interface for SQLite (local) and Supabase (production).
"""

from .adapter import DatabaseAdapter
from .sqlite_adapter import SQLiteAdapter

__all__ = ["DatabaseAdapter", "SQLiteAdapter"]
