"""Task management API endpoints."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

from ...models.tasks import (
    TaskStatus,
    TaskType,
    GenerationTask,
    TaskCreate,
    TaskResponse,
    TaskListResponse,
    RevertResponse,
)
from ...repositories import SQLiteTaskRepository
from ...config import settings

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _get_database_path() -> str:
    """Extract SQLite database path from connection URL."""
    url = settings.database_url
    if url.startswith("sqlite+aiosqlite:///"):
        return url.replace("sqlite+aiosqlite:///", "")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "")
    raise ValueError(f"Unsupported database URL: {url}")


async def _task_to_response(repo: SQLiteTaskRepository, task: GenerationTask) -> TaskResponse:
    """Convert GenerationTask to TaskResponse with content log."""
    content_log = await repo.get_content_log_by_task(task.id)
    return TaskResponse(
        id=task.id,
        task_type=task.task_type,
        status=task.status,
        payload=task.payload,
        user_context=task.user_context,
        created_at=task.created_at,
        delayed_until=task.delayed_until,
        started_at=task.started_at,
        completed_at=task.completed_at,
        progress_current=task.progress_current,
        progress_total=task.progress_total,
        progress_message=task.progress_message,
        error_message=task.error_message,
        retry_count=task.retry_count,
        max_retries=task.max_retries,
        accepted_at=task.accepted_at,
        reverted_at=task.reverted_at,
        content_log=content_log,
    )


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    status: TaskStatus | None = Query(None, description="Filter by status"),
    task_type: TaskType | None = Query(None, description="Filter by task type"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of tasks"),
    offset: int = Query(0, ge=0, description="Number of tasks to skip"),
) -> TaskListResponse:
    """List all tasks with optional filtering."""
    repo = SQLiteTaskRepository(_get_database_path())
    try:
        await repo.connect()
        tasks = await repo.get_tasks(
            status=status,
            task_type=task_type,
            limit=limit,
            offset=offset,
        )
        total = await repo.count_tasks(status=status, task_type=task_type)

        # Convert to response models (without content_log for list view)
        task_responses = []
        for task in tasks:
            task_responses.append(TaskResponse(
                id=task.id,
                task_type=task.task_type,
                status=task.status,
                payload=task.payload,
                user_context=task.user_context,
                created_at=task.created_at,
                delayed_until=task.delayed_until,
                started_at=task.started_at,
                completed_at=task.completed_at,
                progress_current=task.progress_current,
                progress_total=task.progress_total,
                progress_message=task.progress_message,
                error_message=task.error_message,
                retry_count=task.retry_count,
                max_retries=task.max_retries,
                accepted_at=task.accepted_at,
                reverted_at=task.reverted_at,
                content_log=[],  # Empty for list view
            ))

        return TaskListResponse(tasks=task_responses, total=total)
    finally:
        await repo.disconnect()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str) -> TaskResponse:
    """Get task details including content log."""
    repo = SQLiteTaskRepository(_get_database_path())
    try:
        await repo.connect()
        task = await repo.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return await _task_to_response(repo, task)
    finally:
        await repo.disconnect()


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(data: TaskCreate) -> TaskResponse:
    """Create a new generation task."""
    repo = SQLiteTaskRepository(_get_database_path())
    try:
        await repo.connect()
        task = GenerationTask(
            task_type=data.task_type,
            payload=data.payload,
            user_context=data.user_context,
            delayed_until=data.delayed_until,
        )
        created = await repo.create_task(task)
        return await _task_to_response(repo, created)
    finally:
        await repo.disconnect()


@router.post("/{task_id}/cancel", response_model=TaskResponse)
async def cancel_task(task_id: str) -> TaskResponse:
    """Cancel a pending or in_progress task."""
    repo = SQLiteTaskRepository(_get_database_path())
    try:
        await repo.connect()
        task = await repo.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if task.status not in (TaskStatus.PENDING, TaskStatus.IN_PROGRESS):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel task with status '{task.status.value}'"
            )

        task.status = TaskStatus.CANCELLED
        updated = await repo.update_task(task)
        return await _task_to_response(repo, updated)
    finally:
        await repo.disconnect()


@router.post("/{task_id}/retry", response_model=TaskResponse)
async def retry_task(task_id: str) -> TaskResponse:
    """Retry a failed task."""
    repo = SQLiteTaskRepository(_get_database_path())
    try:
        await repo.connect()
        task = await repo.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if task.status != TaskStatus.FAILED:
            raise HTTPException(
                status_code=400,
                detail=f"Can only retry failed tasks, current status is '{task.status.value}'"
            )

        # Reset task for retry
        task.status = TaskStatus.PENDING
        task.error_message = None
        task.started_at = None
        task.completed_at = None
        task.progress_current = 0
        task.progress_total = 0
        task.progress_message = None
        task.delayed_until = None

        updated = await repo.update_task(task)
        return await _task_to_response(repo, updated)
    finally:
        await repo.disconnect()


@router.post("/{task_id}/accept", response_model=TaskResponse)
async def accept_task(task_id: str) -> TaskResponse:
    """Accept completed task results."""
    repo = SQLiteTaskRepository(_get_database_path())
    try:
        await repo.connect()
        task = await repo.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if task.status != TaskStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail=f"Can only accept completed tasks, current status is '{task.status.value}'"
            )

        if task.accepted_at:
            raise HTTPException(status_code=400, detail="Task already accepted")

        if task.reverted_at:
            raise HTTPException(status_code=400, detail="Task has been reverted")

        task.accepted_at = datetime.utcnow()
        updated = await repo.update_task(task)
        return await _task_to_response(repo, updated)
    finally:
        await repo.disconnect()


@router.post("/{task_id}/revert", response_model=RevertResponse)
async def revert_task(task_id: str) -> RevertResponse:
    """Revert all changes made by a task.

    Note: The actual revert logic (deleting/restoring entities) will be
    implemented in the Task Runner phase. This endpoint currently marks
    the task as reverted and counts what would be reverted.
    """
    repo = SQLiteTaskRepository(_get_database_path())
    try:
        await repo.connect()
        task = await repo.get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if task.status != TaskStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail=f"Can only revert completed tasks, current status is '{task.status.value}'"
            )

        if task.accepted_at:
            raise HTTPException(status_code=400, detail="Cannot revert accepted task")

        if task.reverted_at:
            raise HTTPException(status_code=400, detail="Task already reverted")

        # Get content log to count what will be reverted
        content_log = await repo.get_content_log_by_task(task_id)

        # Count by entity type
        reverted_count: dict[str, int] = {}
        for log in content_log:
            entity_plural = f"{log.entity_type}s"  # Simple pluralization
            reverted_count[entity_plural] = reverted_count.get(entity_plural, 0) + 1

        # TODO: Actual revert logic will be implemented with Task Runner
        # For now, we just mark as reverted and the actual cleanup would
        # happen when the revert handler is implemented

        task.reverted_at = datetime.utcnow()
        await repo.update_task(task)

        return RevertResponse(
            id=task.id,
            status=task.status,
            reverted_at=task.reverted_at,
            reverted_count=reverted_count,
        )
    finally:
        await repo.disconnect()
