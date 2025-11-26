"""Abstract Task Repository interface."""

from abc import ABC, abstractmethod
from datetime import datetime

from ..models.tasks import (
    GenerationTask,
    TaskContentLog,
    TaskStatus,
    TaskType,
)


class TaskRepository(ABC):
    """Abstract interface for task data access.

    Implementations:
    - SQLiteTaskRepository: For local development and testing
    - SupabaseTaskRepository: For production deployment (future)
    """

    # -------------------------------------------------------------------------
    # Connection Management
    # -------------------------------------------------------------------------

    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to data store."""
        ...

    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection to data store."""
        ...

    # -------------------------------------------------------------------------
    # Tasks CRUD
    # -------------------------------------------------------------------------

    @abstractmethod
    async def create_task(self, task: GenerationTask) -> GenerationTask:
        """Create a new generation task."""
        ...

    @abstractmethod
    async def get_task_by_id(self, task_id: str) -> GenerationTask | None:
        """Get a task by ID."""
        ...

    @abstractmethod
    async def get_tasks(
        self,
        status: TaskStatus | None = None,
        task_type: TaskType | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[GenerationTask]:
        """Get tasks with optional filtering."""
        ...

    @abstractmethod
    async def count_tasks(
        self,
        status: TaskStatus | None = None,
        task_type: TaskType | None = None,
    ) -> int:
        """Count tasks with optional filtering."""
        ...

    @abstractmethod
    async def update_task(self, task: GenerationTask) -> GenerationTask:
        """Update an existing task."""
        ...

    @abstractmethod
    async def delete_task(self, task_id: str) -> bool:
        """Delete a task. Returns True if deleted, False if not found."""
        ...

    # -------------------------------------------------------------------------
    # Task Queue Operations
    # -------------------------------------------------------------------------

    @abstractmethod
    async def get_next_pending_task(self) -> GenerationTask | None:
        """Get oldest pending task that is ready to run (delayed_until <= now)."""
        ...

    @abstractmethod
    async def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        error_message: str | None = None,
    ) -> None:
        """Update task status and optionally error message."""
        ...

    @abstractmethod
    async def update_task_progress(
        self,
        task_id: str,
        current: int,
        total: int,
        message: str | None = None,
    ) -> None:
        """Update task progress."""
        ...

    @abstractmethod
    async def update_task_heartbeat(self, task_id: str) -> None:
        """Update task heartbeat timestamp."""
        ...

    @abstractmethod
    async def get_stuck_tasks(self, timeout_seconds: int) -> list[GenerationTask]:
        """Get tasks with stale heartbeats (in_progress but no recent heartbeat)."""
        ...

    @abstractmethod
    async def increment_retry_count(self, task_id: str, delay_seconds: int) -> None:
        """Increment retry count and set delayed_until for retry."""
        ...

    # -------------------------------------------------------------------------
    # Content Log
    # -------------------------------------------------------------------------

    @abstractmethod
    async def create_content_log(self, log: TaskContentLog) -> TaskContentLog:
        """Create a content log entry."""
        ...

    @abstractmethod
    async def get_content_log_by_task(self, task_id: str) -> list[TaskContentLog]:
        """Get all content log entries for a task."""
        ...

    @abstractmethod
    async def delete_content_log_by_task(self, task_id: str) -> int:
        """Delete all content log entries for a task. Returns count of deleted entries."""
        ...
