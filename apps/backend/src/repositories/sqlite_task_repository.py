"""SQLite implementation of TaskRepository."""

import json
import aiosqlite
from datetime import datetime, timedelta
from typing import Any

from .task_repository import TaskRepository
from ..models.tasks import (
    GenerationTask,
    TaskContentLog,
    TaskStatus,
    TaskType,
    ContentAction,
)


class SQLiteTaskRepository(TaskRepository):
    """SQLite implementation of TaskRepository.

    Uses aiosqlite for async SQLite operations.
    Suitable for local development and testing.
    """

    def __init__(self, database_path: str):
        """Initialize SQLite task repository.

        Args:
            database_path: Path to SQLite database file, or ':memory:' for in-memory
        """
        self._database_path = database_path
        self._connection: aiosqlite.Connection | None = None

    # -------------------------------------------------------------------------
    # Connection Management
    # -------------------------------------------------------------------------

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
            raise RuntimeError("Repository not connected. Call connect() first.")
        return self._connection

    async def _execute(self, sql: str, params: tuple = ()) -> None:
        """Execute a SQL statement."""
        conn = self._ensure_connected()
        await conn.execute(sql, params)
        await conn.commit()

    async def _fetch_one(self, sql: str, params: tuple = ()) -> dict[str, Any] | None:
        """Fetch a single row."""
        conn = self._ensure_connected()
        cursor = await conn.execute(sql, params)
        row = await cursor.fetchone()
        return dict(row) if row else None

    async def _fetch_all(self, sql: str, params: tuple = ()) -> list[dict[str, Any]]:
        """Fetch all rows."""
        conn = self._ensure_connected()
        cursor = await conn.execute(sql, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

    # -------------------------------------------------------------------------
    # Helpers for serialization
    # -------------------------------------------------------------------------

    @staticmethod
    def _datetime_to_str(dt: datetime | None) -> str | None:
        """Convert datetime to ISO format string."""
        return dt.isoformat() if dt else None

    @staticmethod
    def _str_to_datetime(s: str | None) -> datetime | None:
        """Convert ISO format string to datetime."""
        return datetime.fromisoformat(s) if s else None

    def _task_to_row(self, task: GenerationTask) -> tuple:
        """Convert GenerationTask to database row values."""
        return (
            task.id,
            task.task_type.value,
            task.status.value,
            json.dumps(task.payload),
            task.user_context,
            self._datetime_to_str(task.created_at),
            self._datetime_to_str(task.delayed_until),
            self._datetime_to_str(task.started_at),
            self._datetime_to_str(task.completed_at),
            task.progress_current,
            task.progress_total,
            task.progress_message,
            self._datetime_to_str(task.heartbeat_at),
            task.error_message,
            task.retry_count,
            task.max_retries,
            self._datetime_to_str(task.accepted_at),
            self._datetime_to_str(task.reverted_at),
        )

    def _row_to_task(self, row: dict[str, Any]) -> GenerationTask:
        """Convert database row to GenerationTask."""
        return GenerationTask(
            id=row["id"],
            task_type=TaskType(row["task_type"]),
            status=TaskStatus(row["status"]),
            payload=json.loads(row["payload"]),
            user_context=row["user_context"],
            created_at=self._str_to_datetime(row["created_at"]) or datetime.utcnow(),
            delayed_until=self._str_to_datetime(row["delayed_until"]),
            started_at=self._str_to_datetime(row["started_at"]),
            completed_at=self._str_to_datetime(row["completed_at"]),
            progress_current=row["progress_current"] or 0,
            progress_total=row["progress_total"] or 0,
            progress_message=row["progress_message"],
            heartbeat_at=self._str_to_datetime(row["heartbeat_at"]),
            error_message=row["error_message"],
            retry_count=row["retry_count"] or 0,
            max_retries=row["max_retries"] or 3,
            accepted_at=self._str_to_datetime(row["accepted_at"]),
            reverted_at=self._str_to_datetime(row["reverted_at"]),
        )

    def _row_to_content_log(self, row: dict[str, Any]) -> TaskContentLog:
        """Convert database row to TaskContentLog."""
        previous_data = None
        if row["previous_data"]:
            previous_data = json.loads(row["previous_data"])

        return TaskContentLog(
            id=row["id"],
            task_id=row["task_id"],
            entity_type=row["entity_type"],
            entity_id=row["entity_id"],
            action=ContentAction(row["action"]),
            previous_data=previous_data,
            created_at=self._str_to_datetime(row["created_at"]) or datetime.utcnow(),
        )

    # -------------------------------------------------------------------------
    # Tasks CRUD
    # -------------------------------------------------------------------------

    async def create_task(self, task: GenerationTask) -> GenerationTask:
        """Create a new generation task."""
        await self._execute(
            """INSERT INTO generation_tasks
               (id, task_type, status, payload, user_context,
                created_at, delayed_until, started_at, completed_at,
                progress_current, progress_total, progress_message, heartbeat_at,
                error_message, retry_count, max_retries, accepted_at, reverted_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            self._task_to_row(task),
        )
        return task

    async def get_task_by_id(self, task_id: str) -> GenerationTask | None:
        """Get a task by ID."""
        row = await self._fetch_one(
            "SELECT * FROM generation_tasks WHERE id = ?",
            (task_id,),
        )
        return self._row_to_task(row) if row else None

    async def get_tasks(
        self,
        status: TaskStatus | None = None,
        task_type: TaskType | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[GenerationTask]:
        """Get tasks with optional filtering."""
        conditions = []
        params: list[Any] = []

        if status:
            conditions.append("status = ?")
            params.append(status.value)
        if task_type:
            conditions.append("task_type = ?")
            params.append(task_type.value)

        where_clause = " AND ".join(conditions) if conditions else "1=1"

        rows = await self._fetch_all(
            f"""SELECT * FROM generation_tasks
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?""",
            tuple(params + [limit, offset]),
        )
        return [self._row_to_task(row) for row in rows]

    async def count_tasks(
        self,
        status: TaskStatus | None = None,
        task_type: TaskType | None = None,
    ) -> int:
        """Count tasks with optional filtering."""
        conditions = []
        params: list[Any] = []

        if status:
            conditions.append("status = ?")
            params.append(status.value)
        if task_type:
            conditions.append("task_type = ?")
            params.append(task_type.value)

        where_clause = " AND ".join(conditions) if conditions else "1=1"

        row = await self._fetch_one(
            f"SELECT COUNT(*) as count FROM generation_tasks WHERE {where_clause}",
            tuple(params),
        )
        return row["count"] if row else 0

    async def update_task(self, task: GenerationTask) -> GenerationTask:
        """Update an existing task."""
        await self._execute(
            """UPDATE generation_tasks SET
               task_type = ?, status = ?, payload = ?, user_context = ?,
               created_at = ?, delayed_until = ?, started_at = ?, completed_at = ?,
               progress_current = ?, progress_total = ?, progress_message = ?, heartbeat_at = ?,
               error_message = ?, retry_count = ?, max_retries = ?, accepted_at = ?, reverted_at = ?
               WHERE id = ?""",
            (
                task.task_type.value,
                task.status.value,
                json.dumps(task.payload),
                task.user_context,
                self._datetime_to_str(task.created_at),
                self._datetime_to_str(task.delayed_until),
                self._datetime_to_str(task.started_at),
                self._datetime_to_str(task.completed_at),
                task.progress_current,
                task.progress_total,
                task.progress_message,
                self._datetime_to_str(task.heartbeat_at),
                task.error_message,
                task.retry_count,
                task.max_retries,
                self._datetime_to_str(task.accepted_at),
                self._datetime_to_str(task.reverted_at),
                task.id,
            ),
        )
        return task

    async def delete_task(self, task_id: str) -> bool:
        """Delete a task. Returns True if deleted, False if not found."""
        conn = self._ensure_connected()
        # Content log will be deleted by CASCADE
        cursor = await conn.execute(
            "DELETE FROM generation_tasks WHERE id = ?",
            (task_id,),
        )
        await conn.commit()
        return cursor.rowcount > 0

    # -------------------------------------------------------------------------
    # Task Queue Operations
    # -------------------------------------------------------------------------

    async def get_next_pending_task(self) -> GenerationTask | None:
        """Get oldest pending task that is ready to run."""
        row = await self._fetch_one(
            """SELECT * FROM generation_tasks
               WHERE status = 'pending'
               AND (delayed_until IS NULL OR delayed_until <= datetime('now'))
               ORDER BY created_at ASC
               LIMIT 1""",
        )
        return self._row_to_task(row) if row else None

    async def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        error_message: str | None = None,
    ) -> None:
        """Update task status and optionally error message."""
        if error_message is not None:
            await self._execute(
                """UPDATE generation_tasks
                   SET status = ?, error_message = ?
                   WHERE id = ?""",
                (status.value, error_message, task_id),
            )
        else:
            await self._execute(
                "UPDATE generation_tasks SET status = ? WHERE id = ?",
                (status.value, task_id),
            )

    async def update_task_progress(
        self,
        task_id: str,
        current: int,
        total: int,
        message: str | None = None,
    ) -> None:
        """Update task progress."""
        await self._execute(
            """UPDATE generation_tasks
               SET progress_current = ?, progress_total = ?, progress_message = ?
               WHERE id = ?""",
            (current, total, message, task_id),
        )

    async def update_task_heartbeat(self, task_id: str) -> None:
        """Update task heartbeat timestamp."""
        await self._execute(
            """UPDATE generation_tasks
               SET heartbeat_at = datetime('now')
               WHERE id = ?""",
            (task_id,),
        )

    async def get_stuck_tasks(self, timeout_seconds: int) -> list[GenerationTask]:
        """Get tasks with stale heartbeats."""
        rows = await self._fetch_all(
            """SELECT * FROM generation_tasks
               WHERE status = 'in_progress'
               AND heartbeat_at IS NOT NULL
               AND heartbeat_at < datetime('now', ? || ' seconds')""",
            (f"-{timeout_seconds}",),
        )
        return [self._row_to_task(row) for row in rows]

    async def increment_retry_count(self, task_id: str, delay_seconds: int) -> None:
        """Increment retry count and set delayed_until for retry."""
        delayed_until = datetime.utcnow() + timedelta(seconds=delay_seconds)
        await self._execute(
            """UPDATE generation_tasks
               SET retry_count = retry_count + 1,
                   status = 'pending',
                   delayed_until = ?
               WHERE id = ?""",
            (self._datetime_to_str(delayed_until), task_id),
        )

    # -------------------------------------------------------------------------
    # Content Log
    # -------------------------------------------------------------------------

    async def create_content_log(self, log: TaskContentLog) -> TaskContentLog:
        """Create a content log entry."""
        previous_data_json = json.dumps(log.previous_data) if log.previous_data else None
        await self._execute(
            """INSERT INTO task_content_log
               (id, task_id, entity_type, entity_id, action, previous_data, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                log.id,
                log.task_id,
                log.entity_type,
                log.entity_id,
                log.action.value,
                previous_data_json,
                self._datetime_to_str(log.created_at),
            ),
        )
        return log

    async def get_content_log_by_task(self, task_id: str) -> list[TaskContentLog]:
        """Get all content log entries for a task."""
        rows = await self._fetch_all(
            "SELECT * FROM task_content_log WHERE task_id = ? ORDER BY created_at ASC",
            (task_id,),
        )
        return [self._row_to_content_log(row) for row in rows]

    async def delete_content_log_by_task(self, task_id: str) -> int:
        """Delete all content log entries for a task."""
        conn = self._ensure_connected()
        cursor = await conn.execute(
            "DELETE FROM task_content_log WHERE task_id = ?",
            (task_id,),
        )
        await conn.commit()
        return cursor.rowcount
