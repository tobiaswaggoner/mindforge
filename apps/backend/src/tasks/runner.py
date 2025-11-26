"""Background task runner with polling loop."""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Callable, Any

from ..repositories import TaskRepository
from ..models.tasks import GenerationTask, TaskStatus, TaskContentLog, ContentAction
from ..core.circuit_breaker import CircuitOpenError
from .registry import TaskHandlerRegistry

logger = logging.getLogger(__name__)

# Configuration
POLL_INTERVAL = 5  # seconds
HEARTBEAT_INTERVAL = 30  # seconds
HEARTBEAT_TIMEOUT = 90  # seconds
DEFAULT_RETRY_BASE_DELAY = 10  # seconds
DEFAULT_RETRY_MAX_DELAY = 300  # seconds (5 minutes)


def calculate_retry_delay(retry_count: int) -> int:
    """Calculate exponential backoff delay for retry.

    Args:
        retry_count: Current retry count (0-indexed)

    Returns:
        Delay in seconds before next retry
    """
    delay = DEFAULT_RETRY_BASE_DELAY * (2 ** retry_count)
    return min(delay, DEFAULT_RETRY_MAX_DELAY)


class TaskRunner:
    """Background task runner that processes tasks from the queue.

    Usage:
        runner = TaskRunner(repository)
        await runner.start()
        # ... application runs ...
        await runner.stop()
    """

    def __init__(self, repository: TaskRepository):
        """Initialize task runner.

        Args:
            repository: Task repository for database access
        """
        self._repository = repository
        self._shutdown_event = asyncio.Event()
        self._current_task_id: str | None = None
        self._poll_task: asyncio.Task | None = None
        self._stuck_checker_task: asyncio.Task | None = None

    @property
    def is_running(self) -> bool:
        """Check if the runner is currently running."""
        return not self._shutdown_event.is_set()

    @property
    def current_task_id(self) -> str | None:
        """Get the ID of the currently executing task."""
        return self._current_task_id

    async def start(self) -> None:
        """Start the task runner loop."""
        logger.info("Task runner starting...")
        self._shutdown_event.clear()
        await self._repository.connect()

        # Start background tasks
        self._poll_task = asyncio.create_task(self._poll_loop())
        self._stuck_checker_task = asyncio.create_task(self._stuck_task_checker())

        logger.info("Task runner started")

    async def stop(self) -> None:
        """Stop the task runner gracefully."""
        logger.info("Task runner stopping...")
        self._shutdown_event.set()

        # Wait for background tasks to complete
        if self._poll_task:
            try:
                await asyncio.wait_for(self._poll_task, timeout=10.0)
            except asyncio.TimeoutError:
                logger.warning("Poll loop did not stop gracefully, cancelling")
                self._poll_task.cancel()

        if self._stuck_checker_task:
            try:
                await asyncio.wait_for(self._stuck_checker_task, timeout=5.0)
            except asyncio.TimeoutError:
                logger.warning("Stuck checker did not stop gracefully, cancelling")
                self._stuck_checker_task.cancel()

        await self._repository.disconnect()
        logger.info("Task runner stopped")

    async def _poll_loop(self) -> None:
        """Main polling loop that fetches and executes tasks."""
        while not self._shutdown_event.is_set():
            try:
                task = await self._repository.get_next_pending_task()

                if task:
                    await self._execute_task(task)
                else:
                    # No task available - wait before next poll
                    try:
                        await asyncio.wait_for(
                            self._shutdown_event.wait(),
                            timeout=POLL_INTERVAL
                        )
                    except asyncio.TimeoutError:
                        pass  # Continue polling

            except Exception as e:
                logger.error(f"Poll loop error: {e}", exc_info=True)
                try:
                    await asyncio.wait_for(
                        self._shutdown_event.wait(),
                        timeout=POLL_INTERVAL
                    )
                except asyncio.TimeoutError:
                    pass

    async def _stuck_task_checker(self) -> None:
        """Periodically check for stuck tasks and reset them."""
        while not self._shutdown_event.is_set():
            try:
                stuck_tasks = await self._repository.get_stuck_tasks(HEARTBEAT_TIMEOUT)

                for task in stuck_tasks:
                    logger.warning(f"Found stuck task: {task.id}")

                    if task.retry_count < task.max_retries:
                        # Reset for retry
                        delay = calculate_retry_delay(task.retry_count)
                        await self._repository.increment_retry_count(task.id, delay)
                        logger.info(f"Task {task.id} reset for retry (attempt {task.retry_count + 1})")
                    else:
                        # Mark as failed
                        await self._repository.update_task_status(
                            task.id,
                            TaskStatus.FAILED,
                            "Task timed out (no heartbeat)"
                        )
                        logger.error(f"Task {task.id} marked as failed (max retries exceeded)")

            except Exception as e:
                logger.error(f"Stuck task checker error: {e}", exc_info=True)

            # Wait before next check
            try:
                await asyncio.wait_for(
                    self._shutdown_event.wait(),
                    timeout=HEARTBEAT_TIMEOUT / 2
                )
            except asyncio.TimeoutError:
                pass

    async def _execute_task(self, task: GenerationTask) -> None:
        """Execute a single task with heartbeat and error handling."""
        self._current_task_id = task.id
        logger.info(f"Starting task {task.id} ({task.task_type.value})")

        # Mark as in_progress
        await self._repository.update_task_status(task.id, TaskStatus.IN_PROGRESS)
        task.started_at = datetime.utcnow()
        task.status = TaskStatus.IN_PROGRESS
        await self._repository.update_task(task)

        # Start heartbeat
        heartbeat_stop = asyncio.Event()
        heartbeat_task = asyncio.create_task(
            self._heartbeat_loop(task.id, heartbeat_stop)
        )

        try:
            # Check if handler exists
            if not TaskHandlerRegistry.is_registered(task.task_type.value):
                raise ValueError(f"No handler registered for task type: {task.task_type.value}")

            # Get handler and execute
            handler = TaskHandlerRegistry.get_handler(task.task_type.value)
            await handler.run(
                task=task,
                update_progress=self._make_progress_callback(task.id),
                log_artifact=self._make_artifact_callback(task.id),
            )

            # Success
            logger.info(f"Task {task.id} completed successfully")
            await self._repository.update_task_status(task.id, TaskStatus.COMPLETED)
            task.completed_at = datetime.utcnow()
            task.status = TaskStatus.COMPLETED
            await self._repository.update_task(task)

        except CircuitOpenError as e:
            # Circuit breaker is open - reschedule task without counting as failure
            logger.warning(
                f"Task {task.id} blocked by circuit breaker '{e.name}', "
                f"rescheduling"
            )
            delay = int(e.retry_after or 60)
            # Reset status to pending with delay, don't increment retry count
            task.status = TaskStatus.PENDING
            task.delayed_until = datetime.utcnow() + timedelta(seconds=delay)
            task.started_at = None
            await self._repository.update_task(task)

        except Exception as e:
            logger.error(f"Task {task.id} failed: {e}", exc_info=True)
            await self._handle_failure(task, str(e))

        finally:
            heartbeat_stop.set()
            try:
                await asyncio.wait_for(heartbeat_task, timeout=5.0)
            except asyncio.TimeoutError:
                heartbeat_task.cancel()
            self._current_task_id = None

    async def _heartbeat_loop(self, task_id: str, stop_event: asyncio.Event) -> None:
        """Send periodic heartbeats while task is running."""
        while not stop_event.is_set():
            try:
                await self._repository.update_task_heartbeat(task_id)
            except Exception as e:
                logger.warning(f"Failed to update heartbeat for task {task_id}: {e}")

            try:
                await asyncio.wait_for(stop_event.wait(), timeout=HEARTBEAT_INTERVAL)
            except asyncio.TimeoutError:
                pass

    async def _handle_failure(self, task: GenerationTask, error_message: str) -> None:
        """Handle task failure with retry logic."""
        task.retry_count += 1

        if task.retry_count < task.max_retries:
            # Schedule for retry with exponential backoff
            delay = calculate_retry_delay(task.retry_count - 1)
            await self._repository.increment_retry_count(task.id, delay)
            logger.info(
                f"Task {task.id} scheduled for retry in {delay}s "
                f"(attempt {task.retry_count}/{task.max_retries})"
            )
        else:
            # Max retries exceeded - mark as failed
            await self._repository.update_task_status(
                task.id,
                TaskStatus.FAILED,
                error_message
            )
            logger.error(f"Task {task.id} failed permanently: {error_message}")

    def _make_progress_callback(
        self, task_id: str
    ) -> Callable[[int, int, str | None], Any]:
        """Create a progress update callback for a task."""
        async def update_progress(current: int, total: int, message: str | None = None):
            await self._repository.update_task_progress(task_id, current, total, message)
            logger.debug(f"Task {task_id} progress: {current}/{total} - {message}")

        return update_progress

    def _make_artifact_callback(
        self, task_id: str
    ) -> Callable[[str, str, str, dict | None], Any]:
        """Create an artifact logging callback for a task."""
        async def log_artifact(
            entity_type: str,
            entity_id: str,
            action: str,
            previous_data: dict | None = None
        ):
            log_entry = TaskContentLog(
                task_id=task_id,
                entity_type=entity_type,
                entity_id=entity_id,
                action=ContentAction(action),
                previous_data=previous_data,
            )
            await self._repository.create_content_log(log_entry)
            logger.debug(f"Task {task_id} artifact: {action} {entity_type} {entity_id}")

        return log_artifact
