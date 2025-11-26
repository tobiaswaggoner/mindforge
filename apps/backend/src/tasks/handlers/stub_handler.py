"""Stub handler for testing task execution."""

import asyncio
import logging
import random
from typing import Callable, Any

from ..registry import TaskHandler, TaskHandlerRegistry
from ...models.tasks import GenerationTask

logger = logging.getLogger(__name__)


@TaskHandlerRegistry.register("generate_clusters")
@TaskHandlerRegistry.register("generate_variants")
@TaskHandlerRegistry.register("regenerate_answers")
class StubHandler(TaskHandler):
    """Stub handler that simulates work for testing.

    This handler:
    - Simulates processing with delays
    - Updates progress during execution
    - Logs fake artifacts to content_log
    - Has a small chance of random failure (for testing retry logic)

    Configuration via payload:
    - count: Number of items to "process" (default: 5)
    - delay: Delay per item in seconds (default: 1.0)
    - fail_rate: Probability of random failure (default: 0.0, set to 0.05 for 5%)
    """

    async def run(
        self,
        task: GenerationTask,
        update_progress: Callable[[int, int, str | None], Any],
        log_artifact: Callable[[str, str, str, dict | None], Any],
    ) -> None:
        """Simulate task execution with delays and progress updates."""
        # Extract configuration from payload
        total = task.payload.get("count", 5)
        delay = task.payload.get("delay", 1.0)
        fail_rate = task.payload.get("fail_rate", 0.0)

        # Determine entity type based on task type
        entity_type_map = {
            "generate_clusters": "cluster",
            "generate_variants": "variant",
            "regenerate_answers": "answer",
        }
        entity_type = entity_type_map.get(task.task_type.value, "item")

        logger.info(
            f"StubHandler starting: {task.task_type.value} "
            f"(count={total}, delay={delay}s, fail_rate={fail_rate})"
        )

        for i in range(total):
            # Update progress
            progress_message = f"Processing {entity_type} {i + 1} of {total}..."
            await update_progress(i + 1, total, progress_message)

            # Simulate work
            await asyncio.sleep(delay)

            # Log fake artifact
            entity_id = f"stub-{task.id[:8]}-{i:03d}"
            await log_artifact(
                entity_type=entity_type,
                entity_id=entity_id,
                action="created",
                previous_data=None,
            )

            logger.debug(f"StubHandler created {entity_type}: {entity_id}")

            # Random failure for testing retry logic
            if fail_rate > 0 and random.random() < fail_rate:
                raise RuntimeError(
                    f"Simulated random failure at item {i + 1}/{total}"
                )

        logger.info(f"StubHandler completed: {total} {entity_type}s created")
