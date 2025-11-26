"""Task management domain models."""

from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4


def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid4())


class TaskStatus(str, Enum):
    """Status of a generation task."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskType(str, Enum):
    """Types of generation tasks."""
    GENERATE_CLUSTERS = "generate_clusters"
    GENERATE_VARIANTS = "generate_variants"
    REGENERATE_ANSWERS = "regenerate_answers"


class ContentAction(str, Enum):
    """Type of content modification action."""
    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"


# --- Core Models ---


class GenerationTask(BaseModel):
    """A queued generation task."""

    id: str = Field(default_factory=generate_uuid)
    task_type: TaskType
    status: TaskStatus = TaskStatus.PENDING
    payload: dict[str, Any]
    user_context: str | None = None

    # Scheduling
    created_at: datetime = Field(default_factory=datetime.utcnow)
    delayed_until: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None

    # Progress
    progress_current: int = 0
    progress_total: int = 0
    progress_message: str | None = None
    heartbeat_at: datetime | None = None

    # Error handling
    error_message: str | None = None
    retry_count: int = 0
    max_retries: int = 3

    # Review workflow
    accepted_at: datetime | None = None
    reverted_at: datetime | None = None


class TaskContentLog(BaseModel):
    """Log entry for content created/modified by a task."""

    id: str = Field(default_factory=generate_uuid)
    task_id: str
    entity_type: str  # 'cluster', 'variant', 'answer'
    entity_id: str
    action: ContentAction
    previous_data: dict[str, Any] | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LLMUsageLog(BaseModel):
    """Log entry for LLM API usage."""

    id: str = Field(default_factory=generate_uuid)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost_cents: int | None = None
    source_type: str | None = None
    source_id: str | None = None


# --- API Models ---


class TaskCreate(BaseModel):
    """Request model for creating a task."""

    task_type: TaskType
    payload: dict[str, Any]
    user_context: str | None = None
    delayed_until: datetime | None = None


class TaskResponse(BaseModel):
    """Response model for task details."""

    id: str
    task_type: TaskType
    status: TaskStatus
    payload: dict[str, Any]
    user_context: str | None

    created_at: datetime
    delayed_until: datetime | None
    started_at: datetime | None
    completed_at: datetime | None

    progress_current: int
    progress_total: int
    progress_message: str | None

    error_message: str | None
    retry_count: int
    max_retries: int

    accepted_at: datetime | None
    reverted_at: datetime | None

    content_log: list[TaskContentLog] = []


class TaskListResponse(BaseModel):
    """Response model for task list."""

    tasks: list[TaskResponse]
    total: int


class RevertResponse(BaseModel):
    """Response for revert operation."""

    id: str
    status: TaskStatus
    reverted_at: datetime
    reverted_count: dict[str, int]  # e.g., {"clusters": 3, "variants": 15}
