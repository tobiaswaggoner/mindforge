"""Task handler registry for dynamic handler registration."""

from abc import ABC, abstractmethod
from typing import Callable, Any

from ..models.tasks import GenerationTask


class TaskHandler(ABC):
    """Base class for all task handlers.

    Implementations should be registered with TaskHandlerRegistry
    using the @TaskHandlerRegistry.register decorator.
    """

    @abstractmethod
    async def run(
        self,
        task: GenerationTask,
        update_progress: Callable[[int, int, str | None], Any],
        log_artifact: Callable[[str, str, str, dict | None], Any],
    ) -> None:
        """Execute the task.

        Args:
            task: The task to execute (with parsed payload)
            update_progress: Callback to update progress (current, total, message)
            log_artifact: Callback to log created artifacts
                         (entity_type, entity_id, action, previous_data)

        Raises:
            Exception: On failure (will trigger retry logic)
        """
        pass


class TaskHandlerRegistry:
    """Registry for task handlers - allows dynamic registration.

    Usage:
        @TaskHandlerRegistry.register("generate_clusters")
        class GenerateClustersHandler(TaskHandler):
            async def run(self, task, update_progress, log_artifact):
                # Implementation
                pass

        # Later, get handler instance:
        handler = TaskHandlerRegistry.get_handler("generate_clusters")
        await handler.run(task, ...)
    """

    _handlers: dict[str, type[TaskHandler]] = {}

    @classmethod
    def register(cls, task_type: str):
        """Decorator to register a handler for a task type.

        Args:
            task_type: The task type string (e.g., "generate_clusters")

        Returns:
            Decorator function
        """
        def decorator(handler_class: type[TaskHandler]):
            cls._handlers[task_type] = handler_class
            return handler_class
        return decorator

    @classmethod
    def get_handler(cls, task_type: str) -> TaskHandler:
        """Get handler instance for a task type.

        Args:
            task_type: The task type string

        Returns:
            New instance of the registered handler

        Raises:
            ValueError: If no handler is registered for the task type
        """
        if task_type not in cls._handlers:
            raise ValueError(f"No handler registered for task type: {task_type}")
        return cls._handlers[task_type]()

    @classmethod
    def is_registered(cls, task_type: str) -> bool:
        """Check if a handler is registered for a task type."""
        return task_type in cls._handlers

    @classmethod
    def get_registered_types(cls) -> list[str]:
        """Get list of all registered task types."""
        return list(cls._handlers.keys())
