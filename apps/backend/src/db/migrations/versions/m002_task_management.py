"""Task Management schema for async content generation.

Creates:
- generation_tasks: Task queue with status, progress, retry logic
- task_content_log: Artifact tracking with rollback support
- llm_usage_log: Token/cost tracking for all LLM calls
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ...adapter import DatabaseAdapter

NAME = "m002_task_management"


async def up(adapter: "DatabaseAdapter") -> None:
    """Create task management schema."""
    await adapter.executescript("""
        -- Generation Tasks (Queue)
        CREATE TABLE generation_tasks (
            id TEXT PRIMARY KEY,
            task_type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            payload TEXT NOT NULL,
            user_context TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            delayed_until TEXT,
            started_at TEXT,
            completed_at TEXT,
            progress_current INTEGER DEFAULT 0,
            progress_total INTEGER DEFAULT 0,
            progress_message TEXT,
            heartbeat_at TEXT,
            error_message TEXT,
            retry_count INTEGER DEFAULT 0,
            max_retries INTEGER DEFAULT 3,
            accepted_at TEXT,
            reverted_at TEXT
        );

        -- Task Content Log (Artifacts with Rollback)
        CREATE TABLE task_content_log (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL REFERENCES generation_tasks(id) ON DELETE CASCADE,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            action TEXT NOT NULL,
            previous_data TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        -- LLM Usage Log (Cost Tracking)
        CREATE TABLE llm_usage_log (
            id TEXT PRIMARY KEY,
            created_at TEXT DEFAULT (datetime('now')),
            provider TEXT NOT NULL,
            model TEXT NOT NULL,
            prompt_tokens INTEGER NOT NULL,
            completion_tokens INTEGER NOT NULL,
            total_tokens INTEGER NOT NULL,
            cost_cents INTEGER,
            source_type TEXT,
            source_id TEXT
        );

        -- Indices for efficient queries
        CREATE INDEX idx_tasks_status ON generation_tasks(status);
        CREATE INDEX idx_tasks_status_delayed ON generation_tasks(status, delayed_until);
        CREATE INDEX idx_tasks_heartbeat ON generation_tasks(heartbeat_at);
        CREATE INDEX idx_tasks_created ON generation_tasks(created_at);
        CREATE INDEX idx_content_log_task ON task_content_log(task_id);
        CREATE INDEX idx_content_log_entity ON task_content_log(entity_type, entity_id);
        CREATE INDEX idx_llm_usage_created ON llm_usage_log(created_at);
        CREATE INDEX idx_llm_usage_source ON llm_usage_log(source_type, source_id);
    """)
