# Implementierungsplan: Task Management System

**Datum:** 2025-11-26
**Epic:** E01 - Task Management
**Referenz:** [docs/architecture/task-management.md](../docs/architecture/task-management.md)

---

## Übersicht

Dieser Plan beschreibt die schrittweise Implementierung des Task Management Systems für die Content-Pipeline. Das System ermöglicht asynchrone LLM-basierte Content-Generierung mit Queuing, Progress-Tracking und Rollback-Funktionalität.

---

## Analyse des bestehenden Codes

### Patterns die wir übernehmen

| Komponente | Bestehendes Pattern | Anwendung |
|------------|---------------------|-----------|
| **Migration** | `versions/m00X_name.py` mit `NAME` + `up()` | Neue Migration `m002_task_management.py` |
| **Models** | Pydantic BaseModel in `models/` | Neue Models in `models/tasks.py` |
| **Repository** | Abstract + SQLite Implementation | `TaskRepository` + `SQLiteTaskRepository` |
| **API Routes** | FastAPI Router in `api/routes/` | Neue Route `tasks.py` |

### Bestehende Struktur

```
apps/backend/src/
├── api/routes/          # FastAPI Router (subjects.py, clusters.py, ...)
├── db/
│   ├── adapter.py       # Abstract DatabaseAdapter
│   ├── sqlite_adapter.py
│   └── migrations/
│       ├── runner.py    # MigrationRunner
│       └── versions/    # m001_initial_schema.py
├── models/
│   └── content.py       # Subject, QuestionCluster, etc.
└── repositories/
    ├── content_repository.py      # Abstract
    └── sqlite_content_repository.py
```

---

## Phasen-Übersicht

| Phase | Beschreibung | Dateien | Geschätzte Komplexität |
|-------|--------------|---------|------------------------|
| **1** | DB-Schema & Migration | 1 Datei | Niedrig |
| **2** | Pydantic Models | 1 Datei | Niedrig |
| **3** | Task Repository | 2 Dateien | Mittel |
| **4** | API Endpoints | 1 Datei + main.py | Mittel |
| **5** | Task Runner Basis | 2-3 Dateien | Mittel-Hoch |
| **6** | Stub Handler & Test | 1-2 Dateien | Niedrig |
| **7** | Circuit Breaker | 2 Dateien | Mittel |

---

## Phase 1: Datenbank-Migration

### Ziel
Erstellen der Tabellen `generation_tasks`, `task_content_log` und `llm_usage_log`.

### Neue Datei: `apps/backend/src/db/migrations/versions/m002_task_management.py`

```python
"""Task Management schema for async content generation.

Creates:
- generation_tasks: Task queue with status, progress, retry logic
- task_content_log: Artifact tracking with rollback support
- llm_usage_log: Token/cost tracking for all LLM calls
"""

NAME = "m002_task_management"

async def up(adapter) -> None:
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

        -- Indices
        CREATE INDEX idx_tasks_status ON generation_tasks(status);
        CREATE INDEX idx_tasks_status_delayed ON generation_tasks(status, delayed_until);
        CREATE INDEX idx_tasks_heartbeat ON generation_tasks(heartbeat_at);
        CREATE INDEX idx_tasks_created ON generation_tasks(created_at);
        CREATE INDEX idx_content_log_task ON task_content_log(task_id);
        CREATE INDEX idx_content_log_entity ON task_content_log(entity_type, entity_id);
        CREATE INDEX idx_llm_usage_created ON llm_usage_log(created_at);
        CREATE INDEX idx_llm_usage_source ON llm_usage_log(source_type, source_id);
    """)
```

### Validierung
- [ ] Migration erscheint in `GET /migrations/status` als pending
- [ ] `POST /migrations/run` führt Migration aus
- [ ] Tabellen existieren in SQLite

---

## Phase 2: Pydantic Models

### Ziel
Type-safe Models für Tasks, Content-Log und API Request/Response.

### Neue Datei: `apps/backend/src/models/tasks.py`

```python
"""Task management domain models."""

from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4


def generate_uuid() -> str:
    return str(uuid4())


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskType(str, Enum):
    GENERATE_CLUSTERS = "generate_clusters"
    GENERATE_VARIANTS = "generate_variants"
    REGENERATE_ANSWERS = "regenerate_answers"


class ContentAction(str, Enum):
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
```

### Update: `apps/backend/src/models/__init__.py`

```python
from .content import Subject, QuestionCluster, QuestionVariant, Answer, QuestionWithAnswers
from .tasks import (
    TaskStatus,
    TaskType,
    ContentAction,
    GenerationTask,
    TaskContentLog,
    LLMUsageLog,
    TaskCreate,
    TaskResponse,
    TaskListResponse,
    RevertResponse,
)
```

---

## Phase 3: Task Repository

### Ziel
Data Access Layer für Tasks mit CRUD + spezifischen Queries.

### Neue Datei: `apps/backend/src/repositories/task_repository.py`

```python
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
    """Abstract interface for task data access."""

    # --- Connection ---
    @abstractmethod
    async def connect(self) -> None: ...

    @abstractmethod
    async def disconnect(self) -> None: ...

    # --- Tasks CRUD ---
    @abstractmethod
    async def create_task(self, task: GenerationTask) -> GenerationTask: ...

    @abstractmethod
    async def get_task_by_id(self, task_id: str) -> GenerationTask | None: ...

    @abstractmethod
    async def get_tasks(
        self,
        status: TaskStatus | None = None,
        task_type: TaskType | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[GenerationTask]: ...

    @abstractmethod
    async def count_tasks(
        self,
        status: TaskStatus | None = None,
        task_type: TaskType | None = None,
    ) -> int: ...

    @abstractmethod
    async def update_task(self, task: GenerationTask) -> GenerationTask: ...

    @abstractmethod
    async def delete_task(self, task_id: str) -> bool: ...

    # --- Task Queue Operations ---
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
    ) -> None: ...

    @abstractmethod
    async def update_task_progress(
        self,
        task_id: str,
        current: int,
        total: int,
        message: str | None = None,
    ) -> None: ...

    @abstractmethod
    async def update_task_heartbeat(self, task_id: str) -> None: ...

    @abstractmethod
    async def get_stuck_tasks(self, timeout_seconds: int) -> list[GenerationTask]:
        """Get tasks with stale heartbeats."""
        ...

    @abstractmethod
    async def increment_retry_count(self, task_id: str, delay_seconds: int) -> None:
        """Increment retry count and set delayed_until."""
        ...

    # --- Content Log ---
    @abstractmethod
    async def create_content_log(self, log: TaskContentLog) -> TaskContentLog: ...

    @abstractmethod
    async def get_content_log_by_task(self, task_id: str) -> list[TaskContentLog]: ...

    @abstractmethod
    async def delete_content_log_by_task(self, task_id: str) -> int: ...
```

### Neue Datei: `apps/backend/src/repositories/sqlite_task_repository.py`

SQLite-Implementation des TaskRepository (analog zu `sqlite_content_repository.py`).

Kernmethoden:
- JSON-Serialisierung für `payload` und `previous_data`
- Datetime-Handling (ISO-Format Strings in SQLite)
- `get_next_pending_task()` mit `WHERE status = 'pending' AND (delayed_until IS NULL OR delayed_until <= datetime('now'))`

### Update: `apps/backend/src/repositories/__init__.py`

```python
from .content_repository import ContentRepository
from .sqlite_content_repository import SQLiteContentRepository
from .task_repository import TaskRepository
from .sqlite_task_repository import SQLiteTaskRepository
```

---

## Phase 4: API Endpoints

### Ziel
REST-Endpoints für Task-Management gemäß Architektur-Dokument.

### Neue Datei: `apps/backend/src/api/routes/tasks.py`

| Endpoint | Method | Handler |
|----------|--------|---------|
| `/tasks` | GET | `list_tasks()` - Filter: status, task_type, limit, offset |
| `/tasks/{id}` | GET | `get_task()` - Inkl. content_log |
| `/tasks` | POST | `create_task()` - Validierung, Task in Queue |
| `/tasks/{id}/cancel` | POST | `cancel_task()` - Nur pending/in_progress |
| `/tasks/{id}/retry` | POST | `retry_task()` - Nur failed |
| `/tasks/{id}/accept` | POST | `accept_task()` - Nur completed |
| `/tasks/{id}/revert` | POST | `revert_task()` - Rollback via content_log |

### Update: `apps/backend/src/main.py`

```python
from .api.routes import health, migrations, subjects, clusters, variants, answers, tasks

# ... existing code ...

app.include_router(tasks.router)
```

### Validierung
- [ ] `POST /tasks` erstellt Task mit status=pending
- [ ] `GET /tasks` listet Tasks mit Filtern
- [ ] `GET /tasks/{id}` zeigt Details + content_log
- [ ] Cancel/Retry/Accept/Revert funktionieren

---

## Phase 5: Task Runner

### Ziel
Background-Thread der Tasks aus der Queue abarbeitet.

### Neue Dateien

#### `apps/backend/src/tasks/__init__.py`
Package für Task-Runner und Handler.

#### `apps/backend/src/tasks/runner.py`

```python
"""Background task runner with polling loop."""

import asyncio
import logging
from datetime import datetime
from typing import Callable, Awaitable

from ..repositories import TaskRepository
from ..models.tasks import GenerationTask, TaskStatus
from .registry import TaskHandlerRegistry

logger = logging.getLogger(__name__)

POLL_INTERVAL = 5  # seconds
HEARTBEAT_INTERVAL = 30  # seconds
HEARTBEAT_TIMEOUT = 90  # seconds


class TaskRunner:
    """Runs pending tasks from the queue."""

    def __init__(self, repository: TaskRepository):
        self._repository = repository
        self._shutdown_event = asyncio.Event()
        self._current_task_id: str | None = None

    async def start(self) -> None:
        """Start the task runner loop."""
        logger.info("Task runner starting...")
        await self._repository.connect()

        # Start background tasks
        asyncio.create_task(self._poll_loop())
        asyncio.create_task(self._stuck_task_checker())

    async def stop(self) -> None:
        """Stop the task runner gracefully."""
        logger.info("Task runner stopping...")
        self._shutdown_event.set()
        await self._repository.disconnect()

    async def _poll_loop(self) -> None:
        """Main polling loop."""
        while not self._shutdown_event.is_set():
            try:
                task = await self._repository.get_next_pending_task()

                if task:
                    await self._execute_task(task)
                else:
                    await asyncio.sleep(POLL_INTERVAL)

            except Exception as e:
                logger.error(f"Poll loop error: {e}")
                await asyncio.sleep(POLL_INTERVAL)

    async def _execute_task(self, task: GenerationTask) -> None:
        """Execute a single task."""
        self._current_task_id = task.id

        # Mark as in_progress
        await self._repository.update_task_status(task.id, TaskStatus.IN_PROGRESS)
        task.started_at = datetime.utcnow()
        await self._repository.update_task(task)

        # Start heartbeat
        heartbeat_stop = asyncio.Event()
        heartbeat_task = asyncio.create_task(
            self._heartbeat_loop(task.id, heartbeat_stop)
        )

        try:
            # Get handler and execute
            handler = TaskHandlerRegistry.get_handler(task.task_type.value)
            await handler.run(
                task=task,
                update_progress=self._make_progress_callback(task.id),
                log_artifact=self._make_artifact_callback(task.id),
            )

            # Success
            await self._repository.update_task_status(task.id, TaskStatus.COMPLETED)
            task.completed_at = datetime.utcnow()
            await self._repository.update_task(task)

        except Exception as e:
            logger.error(f"Task {task.id} failed: {e}")
            await self._handle_failure(task, str(e))

        finally:
            heartbeat_stop.set()
            await heartbeat_task
            self._current_task_id = None

    # ... helper methods for callbacks, heartbeat, failure handling ...
```

#### `apps/backend/src/tasks/registry.py`

```python
"""Task handler registry."""

from abc import ABC, abstractmethod
from typing import Callable, Any

from ..models.tasks import GenerationTask


class TaskHandler(ABC):
    """Base class for task handlers."""

    @abstractmethod
    async def run(
        self,
        task: GenerationTask,
        update_progress: Callable[[int, int, str | None], Any],
        log_artifact: Callable[[str, str, str, dict | None], Any],
    ) -> None:
        """Execute the task."""
        pass


class TaskHandlerRegistry:
    """Registry for task handlers."""

    _handlers: dict[str, type[TaskHandler]] = {}

    @classmethod
    def register(cls, task_type: str):
        """Decorator to register a handler."""
        def decorator(handler_class: type[TaskHandler]):
            cls._handlers[task_type] = handler_class
            return handler_class
        return decorator

    @classmethod
    def get_handler(cls, task_type: str) -> TaskHandler:
        """Get handler instance for task type."""
        if task_type not in cls._handlers:
            raise ValueError(f"No handler for: {task_type}")
        return cls._handlers[task_type]()
```

### Integration in `main.py`

```python
from contextlib import asynccontextmanager
from .tasks.runner import TaskRunner
from .repositories import SQLiteTaskRepository

task_runner: TaskRunner | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global task_runner
    repo = SQLiteTaskRepository(_get_database_path())
    task_runner = TaskRunner(repo)
    await task_runner.start()
    yield
    await task_runner.stop()

app = FastAPI(lifespan=lifespan, ...)
```

---

## Phase 6: Stub Handler & Integration Test

### Ziel
Funktionierender End-to-End Test mit simulierter Task-Ausführung.

### Neue Datei: `apps/backend/src/tasks/handlers/stub_handler.py`

```python
"""Stub handler for testing task execution."""

import asyncio
import random
from typing import Callable, Any

from ..registry import TaskHandler, TaskHandlerRegistry
from ...models.tasks import GenerationTask


@TaskHandlerRegistry.register("generate_clusters")
@TaskHandlerRegistry.register("generate_variants")
@TaskHandlerRegistry.register("regenerate_answers")
class StubHandler(TaskHandler):
    """Stub handler that simulates work."""

    async def run(
        self,
        task: GenerationTask,
        update_progress: Callable[[int, int, str | None], Any],
        log_artifact: Callable[[str, str, str, dict | None], Any],
    ) -> None:
        """Simulate task execution with delays."""
        total = task.payload.get("count", 5)

        for i in range(total):
            # Update progress
            await update_progress(i + 1, total, f"Processing item {i + 1} of {total}...")

            # Simulate work
            await asyncio.sleep(1)

            # Log fake artifact
            await log_artifact(
                entity_type="cluster",
                entity_id=f"stub-{task.id}-{i}",
                action="created",
                previous_data=None,
            )

            # 5% chance of failure (for testing retry logic)
            if random.random() < 0.05:
                raise RuntimeError("Simulated random failure")
```

### Manueller Test-Flow

1. Migration ausführen: `POST /migrations/run`
2. Task erstellen:
   ```json
   POST /tasks
   {
     "task_type": "generate_clusters",
     "payload": { "subject_id": "test", "count": 5 }
   }
   ```
3. Task-Status beobachten: `GET /tasks/{id}` (mehrfach)
4. Progress sollte von 0→5 laufen
5. Status sollte zu `completed` wechseln
6. Content-Log sollte 5 Einträge haben

---

## Phase 7: Circuit Breaker

### Ziel
Generischer Circuit Breaker für alle externen Service-Aufrufe (LLM, etc.) mit API-Endpoint für Frontend-Status.

### Referenz
Siehe [docs/architecture/task-management.md - Circuit Breaker](../docs/architecture/task-management.md#circuit-breaker)

### Konzept

Der Circuit Breaker ist **generisch** und kann für beliebige Funktionen verwendet werden:
- LLM-Aufrufe (OpenAI, OpenRouter, etc.)
- Externe APIs
- Datenbankverbindungen (falls nötig)

```
     ┌─────────┐
     │ CLOSED  │◀──────────────────────────┐
     │ (normal)│                           │
     └────┬────┘                           │
          │                                │
          │ X Fehler in Folge              │ Success nach
          ▼                                │ Half-Open Test
     ┌─────────┐                           │
     │  OPEN   │                           │
     │ (block) │                           │
     └────┬────┘                           │
          │                                │
          │ Nach Timeout                   │
          ▼                                │
     ┌───────────┐                         │
     │ HALF-OPEN │─────────────────────────┘
     │  (test)   │
     └───────────┘
```

### Neue Datei: `apps/backend/src/core/__init__.py`

Package für Core-Utilities.

### Neue Datei: `apps/backend/src/core/circuit_breaker.py`

```python
"""Generic Circuit Breaker implementation."""

import asyncio
import time
from enum import Enum
from dataclasses import dataclass, field
from typing import Callable, TypeVar, ParamSpec, Any
from functools import wraps
import logging

logger = logging.getLogger(__name__)

P = ParamSpec("P")
T = TypeVar("T")


class CircuitState(str, Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Blocking calls
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Configuration for a circuit breaker."""
    name: str
    failure_threshold: int = 5       # Failures before opening
    success_threshold: int = 2       # Successes in half-open before closing
    timeout_seconds: float = 60.0    # Time in open state before half-open
    excluded_exceptions: tuple = ()  # Exceptions that don't count as failures


@dataclass
class CircuitBreakerState:
    """Runtime state of a circuit breaker."""
    state: CircuitState = CircuitState.CLOSED
    failure_count: int = 0
    success_count: int = 0
    last_failure_time: float | None = None
    last_state_change: float = field(default_factory=time.time)


class CircuitOpenError(Exception):
    """Raised when circuit breaker is open."""
    def __init__(self, name: str, retry_after: float | None = None):
        self.name = name
        self.retry_after = retry_after
        super().__init__(f"Circuit breaker '{name}' is open")


class CircuitBreaker:
    """
    Generic circuit breaker for protecting external service calls.

    Usage:
        # Create a named circuit breaker
        llm_breaker = CircuitBreaker(CircuitBreakerConfig(name="llm"))

        # Use as decorator
        @llm_breaker
        async def call_llm(prompt: str) -> str:
            return await openai.complete(prompt)

        # Or use directly
        async with llm_breaker.protect():
            result = await some_external_call()
    """

    # Global registry of all circuit breakers
    _registry: dict[str, "CircuitBreaker"] = {}

    def __init__(self, config: CircuitBreakerConfig):
        self.config = config
        self._state = CircuitBreakerState()
        self._lock = asyncio.Lock()

        # Register globally
        CircuitBreaker._registry[config.name] = self

    @classmethod
    def get(cls, name: str) -> "CircuitBreaker | None":
        """Get circuit breaker by name."""
        return cls._registry.get(name)

    @classmethod
    def get_all_status(cls) -> dict[str, dict]:
        """Get status of all circuit breakers."""
        return {
            name: breaker.get_status()
            for name, breaker in cls._registry.items()
        }

    @property
    def state(self) -> CircuitState:
        return self._state.state

    @property
    def is_open(self) -> bool:
        return self._state.state == CircuitState.OPEN

    def get_status(self) -> dict:
        """Get current status for API response."""
        retry_after = None
        if self._state.state == CircuitState.OPEN and self._state.last_failure_time:
            elapsed = time.time() - self._state.last_failure_time
            remaining = self.config.timeout_seconds - elapsed
            retry_after = max(0, remaining)

        return {
            "name": self.config.name,
            "state": self._state.state.value,
            "failure_count": self._state.failure_count,
            "success_count": self._state.success_count,
            "retry_after_seconds": retry_after,
        }

    async def _check_state(self) -> None:
        """Check and potentially transition state."""
        async with self._lock:
            if self._state.state == CircuitState.OPEN:
                # Check if timeout has passed
                if self._state.last_failure_time:
                    elapsed = time.time() - self._state.last_failure_time
                    if elapsed >= self.config.timeout_seconds:
                        logger.info(f"Circuit '{self.config.name}' transitioning to HALF_OPEN")
                        self._state.state = CircuitState.HALF_OPEN
                        self._state.success_count = 0
                        self._state.last_state_change = time.time()

    async def record_success(self) -> None:
        """Record a successful call."""
        async with self._lock:
            if self._state.state == CircuitState.HALF_OPEN:
                self._state.success_count += 1
                if self._state.success_count >= self.config.success_threshold:
                    logger.info(f"Circuit '{self.config.name}' transitioning to CLOSED")
                    self._state.state = CircuitState.CLOSED
                    self._state.failure_count = 0
                    self._state.success_count = 0
                    self._state.last_state_change = time.time()
            elif self._state.state == CircuitState.CLOSED:
                # Reset failure count on success
                self._state.failure_count = 0

    async def record_failure(self, exception: Exception) -> None:
        """Record a failed call."""
        # Check if this exception should be excluded
        if isinstance(exception, self.config.excluded_exceptions):
            return

        async with self._lock:
            self._state.failure_count += 1
            self._state.last_failure_time = time.time()

            if self._state.state == CircuitState.HALF_OPEN:
                # Any failure in half-open goes back to open
                logger.warning(f"Circuit '{self.config.name}' transitioning to OPEN (half-open failure)")
                self._state.state = CircuitState.OPEN
                self._state.last_state_change = time.time()
            elif self._state.state == CircuitState.CLOSED:
                if self._state.failure_count >= self.config.failure_threshold:
                    logger.warning(f"Circuit '{self.config.name}' transitioning to OPEN (threshold reached)")
                    self._state.state = CircuitState.OPEN
                    self._state.last_state_change = time.time()

    async def call(self, func: Callable[P, T], *args: P.args, **kwargs: P.kwargs) -> T:
        """Execute a function with circuit breaker protection."""
        await self._check_state()

        if self._state.state == CircuitState.OPEN:
            retry_after = None
            if self._state.last_failure_time:
                retry_after = self.config.timeout_seconds - (time.time() - self._state.last_failure_time)
            raise CircuitOpenError(self.config.name, retry_after)

        try:
            result = await func(*args, **kwargs)
            await self.record_success()
            return result
        except Exception as e:
            await self.record_failure(e)
            raise

    def __call__(self, func: Callable[P, T]) -> Callable[P, T]:
        """Use as decorator."""
        @wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            return await self.call(func, *args, **kwargs)
        return wrapper

    def reset(self) -> None:
        """Manually reset the circuit breaker (for testing/admin)."""
        self._state = CircuitBreakerState()
        logger.info(f"Circuit '{self.config.name}' manually reset")
```

### API Endpoint für Circuit Breaker Status

Erweiterung in `apps/backend/src/api/routes/health.py`:

```python
from ...core.circuit_breaker import CircuitBreaker, CircuitOpenError

@router.get("/health/circuits")
async def get_circuit_status() -> dict:
    """Get status of all circuit breakers."""
    return {
        "circuits": CircuitBreaker.get_all_status(),
        "any_open": any(
            cb.is_open for cb in CircuitBreaker._registry.values()
        ),
    }

@router.post("/health/circuits/{name}/reset")
async def reset_circuit(name: str) -> dict:
    """Manually reset a circuit breaker (admin only)."""
    breaker = CircuitBreaker.get(name)
    if not breaker:
        raise HTTPException(404, f"Circuit breaker '{name}' not found")
    breaker.reset()
    return breaker.get_status()
```

### API Response bei offenem Circuit

Wenn ein Task wegen offenem Circuit fehlschlägt, enthält die Fehlerantwort:

```json
{
    "error": "service_unavailable",
    "message": "LLM service temporarily unavailable",
    "circuit": "llm",
    "retry_after_seconds": 45.2
}
```

### Integration im Task Runner

Erweiterung in `apps/backend/src/tasks/runner.py`:

```python
from ..core.circuit_breaker import CircuitOpenError

async def _execute_task(self, task: GenerationTask) -> None:
    # ... existing code ...

    try:
        handler = TaskHandlerRegistry.get_handler(task.task_type.value)
        await handler.run(...)
        # Success

    except CircuitOpenError as e:
        # Circuit is open - delay task for retry
        logger.warning(f"Task {task.id} blocked by circuit '{e.name}'")
        delay = int(e.retry_after or 60)
        await self._repository.increment_retry_count(task.id, delay)
        # Don't count as failure - just reschedule

    except Exception as e:
        await self._handle_failure(task, str(e))
```

### Verwendung in Handlern (Beispiel)

```python
from ...core.circuit_breaker import CircuitBreaker, CircuitBreakerConfig

# Create circuit breaker for LLM calls (typically at module level)
llm_circuit = CircuitBreaker(CircuitBreakerConfig(
    name="llm",
    failure_threshold=5,
    success_threshold=2,
    timeout_seconds=60,
))

class GenerateClustersHandler(TaskHandler):
    async def run(self, task, update_progress, log_artifact):
        # LLM call is protected by circuit breaker
        @llm_circuit
        async def call_llm(prompt: str) -> str:
            return await openai_client.complete(prompt)

        result = await call_llm("Generate questions...")
        # ...
```

### Validierung
- [ ] Circuit Breaker Status via `GET /health/circuits`
- [ ] Nach 5 Fehlern → State wechselt zu `open`
- [ ] Nach Timeout → State wechselt zu `half_open`
- [ ] Nach 2 Erfolgen in half_open → State wechselt zu `closed`
- [ ] Frontend zeigt "Service temporarily unavailable" wenn `any_open: true`
- [ ] Tasks mit CircuitOpenError werden rescheduled, nicht als failed markiert

---

## Zusammenfassung der zu erstellenden Dateien

### Neue Dateien

| Datei | Phase | Beschreibung |
|-------|-------|--------------|
| `db/migrations/versions/m002_task_management.py` | 1 | Schema-Migration |
| `models/tasks.py` | 2 | Pydantic Models |
| `repositories/task_repository.py` | 3 | Abstract Repository |
| `repositories/sqlite_task_repository.py` | 3 | SQLite Implementation |
| `api/routes/tasks.py` | 4 | REST Endpoints |
| `tasks/__init__.py` | 5 | Package |
| `tasks/runner.py` | 5 | Background Runner |
| `tasks/registry.py` | 5 | Handler Registry |
| `tasks/handlers/__init__.py` | 6 | Handler Package |
| `tasks/handlers/stub_handler.py` | 6 | Test Handler |
| `core/__init__.py` | 7 | Core Package |
| `core/circuit_breaker.py` | 7 | Circuit Breaker Implementation |

### Zu aktualisierende Dateien

| Datei | Phase | Änderung |
|-------|-------|----------|
| `models/__init__.py` | 2 | Exports hinzufügen |
| `repositories/__init__.py` | 3 | Exports hinzufügen |
| `main.py` | 4+5 | Router + Lifespan |
| `api/routes/health.py` | 7 | Circuit Breaker Status Endpoints |
| `tasks/runner.py` | 7 | CircuitOpenError Handling |

---

## Nicht in diesem Plan enthalten (spätere Phasen)

- Echte LLM-Handler (statt Stubs)
- LLM Usage Logging (Befüllen der `llm_usage_log` Tabelle)
- Revert-Logik Implementation (Rollback via content_log)
- Exponentieller Backoff bei Task-Retries (Basis vorhanden, Feintuning später)

Diese werden in separaten Implementierungsplänen behandelt.
