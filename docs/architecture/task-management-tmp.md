# Task Management System

## Übersicht

Das Task Management System ermöglicht die asynchrone Ausführung von langläufigen Operationen, insbesondere LLM-basierte Content-Generierung. Tasks werden in einer Datenbank-Queue gespeichert und von einem Background-Worker abgearbeitet.

## Anwendungsfälle (Initial)

| Task-Typ | Beschreibung | UI-Label | Payload-Beispiel |
|----------|--------------|----------|------------------|
| `generate_clusters` | Neue Frage-Cluster zu einem Subject generieren | "Generate Questions" | `{ "subject_id": "...", "count": 10, "variants_per_cluster": 10 }` |
| `generate_variants` | Neue Varianten zu einem bestehenden Cluster | "Generate Variants" | `{ "cluster_id": "...", "count": 5 }` |
| `regenerate_answers` | Antworten für eine Variante neu generieren | "Regenerate Answers" | `{ "variant_id": "..." }` |

Jeder Task-Typ kann zusätzlichen `user_context` enthalten - Freitext, der als zusätzlicher Kontext in den LLM-Prompt einfließt.

> **Hinweis:** Die Task-Typen verwenden technische Namen (`generate_clusters`), während das UI benutzerfreundliche Labels anzeigt ("Generate Questions").

---

## Frontend-Backend Abstimmung

### Abgestimmte Konventionen

| Aspekt | Entscheidung | Anpassung |
|--------|--------------|-----------|
| Task-Typen | `generate_clusters`, `generate_variants`, `regenerate_answers` | Frontend passt UI-Labels an |
| Status-Enum | `in_progress` (nicht `running`) | Frontend passt an |
| Payload-Struktur | Generisches JSON `payload` + `user_context` | Frontend passt an |
| Artefakt-Tracking | `task_content_log` mit `action` + `previous_data` | Backend erweitert |
| Accept/Revert | `accepted_at`, `reverted_at` Felder + Endpoints | Backend erweitert |

### UI-relevante Felder

Das Frontend zeigt folgende Backend-Felder an:

| Feld | UI-Verwendung |
|------|---------------|
| `delayed_until` | "Scheduled for..." Anzeige |
| `retry_count` / `max_retries` | "Retry 2/3" bei Failed Tasks |
| `progress_current` / `progress_total` | Progress-Bar |
| `progress_message` | Live-Status: "Generating cluster 4 of 10..." |
| `error_message` | Fehleranzeige bei Failed Tasks |

---

## Architektur-Entscheidung

### Gewählte Lösung: Option A - Integrierte DB-Queue

```
┌─────────────────────────────────────────┐
│            FastAPI Backend              │
├─────────────────────────────────────────┤
│  API Routes (CRUD + Task-Endpoints)     │
├─────────────────────────────────────────┤
│  Task Runner (Background Thread)        │
│  - Polling-Loop alle X Sekunden         │
│  - Ruft Task-Handler auf                │
│  - Heartbeat-Updates                    │
├─────────────────────────────────────────┤
│  Task Handler Registry                  │
│  - Dynamische Handler pro Task-Typ      │
│  - Generisches Interface                │
└─────────────────────────────────────────┘
              │
              ▼
        ┌──────────┐
        │ SQLite   │
        │ (Tasks)  │
        └──────────┘
```

**Begründung:**
- Einfach zu implementieren
- Keine zusätzliche Infrastruktur (kein Redis, kein RabbitMQ)
- Für Admin-Tool mit begrenzter Nutzerzahl ausreichend
- Saubere Abstraktion ermöglicht spätere Migration

### Verworfene Alternativen

#### Option B: Separater Worker-Prozess

```
┌─────────────────┐     ┌─────────────────┐
│  FastAPI API    │     │  Worker Process │
└────────┬────────┘     └────────┬────────┘
         └───────────┬───────────┘
                     ▼
               ┌──────────┐
               │ Database │
               └──────────┘
```

**Verworfen weil:**
- Mehr Komplexität (zwei Prozesse managen)
- SQLite hat Probleme mit concurrent Writes
- Für den Anwendungsfall Overkill

#### Option C: Message Queue (Celery/ARQ/RQ)

**Verworfen weil:**
- Benötigt zusätzliche Infrastruktur (Redis)
- Deutlich mehr Setup und Wartung
- Sinnvoll erst bei 100+ concurrent Tasks oder horizontaler Skalierung

---

## Datenbank-Schema

### Tasks-Tabelle

```sql
CREATE TABLE generation_tasks (
    -- Identifikation
    id TEXT PRIMARY KEY,                    -- UUID
    task_type TEXT NOT NULL,                -- 'generate_clusters', 'generate_variants', 'regenerate_answers'

    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- siehe Status-Enum unten

    -- Payload (flexibel, task-type-spezifisch)
    payload TEXT NOT NULL,                  -- JSON: { subject_id, cluster_id, count, ... }
    user_context TEXT,                      -- Freitext für LLM-Prompt

    -- Scheduling
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delayed_until TIMESTAMP,                -- NULL = sofort ausführbar
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Progress & Health Monitoring
    progress_current INTEGER DEFAULT 0,
    progress_total INTEGER DEFAULT 0,
    progress_message TEXT,                  -- Aktueller Schritt als Text
    heartbeat_at TIMESTAMP,                 -- Worker setzt alle 30 Sekunden

    -- Error Handling & Retry
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Review Workflow
    accepted_at TIMESTAMP,                  -- Formale Bestätigung durch User
    reverted_at TIMESTAMP                   -- Rückgängig gemacht durch User
);

-- Indices für effiziente Abfragen
CREATE INDEX idx_tasks_status ON generation_tasks(status);
CREATE INDEX idx_tasks_status_delayed ON generation_tasks(status, delayed_until);
CREATE INDEX idx_tasks_heartbeat ON generation_tasks(heartbeat_at);
CREATE INDEX idx_tasks_created ON generation_tasks(created_at);
```

### Task-Status-Enum

| Status | Beschreibung |
|--------|--------------|
| `pending` | Task wartet auf Ausführung |
| `in_progress` | Task wird gerade ausgeführt |
| `completed` | Task erfolgreich abgeschlossen |
| `failed` | Task fehlgeschlagen (nach max_retries) |
| `cancelled` | Task vom User abgebrochen |

### Content-Log-Tabelle (Artefakte mit Rollback-Support)

Protokolliert alle durch Tasks erstellten/geänderten Objekte. Ermöglicht:
- Anzeige der generierten Inhalte pro Task
- Vollständige Undo/Revert-Funktionalität
- Audit-Trail für alle Änderungen

```sql
CREATE TABLE task_content_log (
    id TEXT PRIMARY KEY,                    -- UUID
    task_id TEXT NOT NULL REFERENCES generation_tasks(id) ON DELETE CASCADE,

    -- Was wurde geändert?
    entity_type TEXT NOT NULL,              -- 'cluster', 'variant', 'answer'
    entity_id TEXT NOT NULL,                -- UUID des betroffenen Objekts

    -- Art der Änderung
    action TEXT NOT NULL,                   -- 'created', 'updated', 'deleted'

    -- Für Rollback: vorheriger Zustand
    previous_data TEXT,                     -- JSON des vorherigen Zustands (NULL bei 'created')

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_log_task ON task_content_log(task_id);
CREATE INDEX idx_content_log_entity ON task_content_log(entity_type, entity_id);
```

### Action-Typen

| Action | Beschreibung | `previous_data` |
|--------|--------------|-----------------|
| `created` | Neues Objekt erstellt | NULL |
| `updated` | Bestehendes Objekt geändert | JSON des alten Zustands |
| `deleted` | Objekt gelöscht | JSON des gelöschten Objekts |

### LLM-Kosten-Tracking (Generisch)

Separates Tracking für alle LLM-Aufrufe - unabhängig davon, ob sie aus Tasks oder anderen Quellen stammen.

```sql
CREATE TABLE llm_usage_log (
    id TEXT PRIMARY KEY,                    -- UUID

    -- Zeitpunkt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- LLM-Details
    provider TEXT NOT NULL,                 -- 'openai', 'openrouter', 'anthropic', ...
    model TEXT NOT NULL,                    -- 'gpt-4', 'gpt-3.5-turbo', ...

    -- Token-Verbrauch
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,

    -- Kosten (in Cent, für einfache Integer-Arithmetik)
    cost_cents INTEGER,                     -- NULL wenn unbekannt

    -- Optionale Verknüpfung
    source_type TEXT,                       -- 'task', 'manual', 'api', ...
    source_id TEXT                          -- z.B. task_id bei Tasks
);

CREATE INDEX idx_llm_usage_created ON llm_usage_log(created_at);
CREATE INDEX idx_llm_usage_source ON llm_usage_log(source_type, source_id);
```

---

## Task Runner Architektur

### Komponenten

```
┌─────────────────────────────────────────────────────────┐
│                    Task Runner                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    ┌─────────────────────────┐    │
│  │  Polling Loop   │───▶│  Task Executor          │    │
│  │  (Background    │    │  - Holt pending Tasks   │    │
│  │   Thread)       │    │  - Ruft Handler auf     │    │
│  └─────────────────┘    │  - Updated Status       │    │
│                         └───────────┬─────────────┘    │
│                                     │                   │
│                                     ▼                   │
│                    ┌────────────────────────────┐       │
│                    │    Handler Registry        │       │
│                    │                            │       │
│                    │  'generate_clusters' ──▶ Handler  │
│                    │  'generate_variants' ──▶ Handler  │
│                    │  'regenerate_answers' ──▶ Handler │
│                    └────────────────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Task Handler Interface

```python
from abc import ABC, abstractmethod
from typing import Callable

class TaskHandler(ABC):
    """Base class for all task handlers."""

    @abstractmethod
    async def run(
        self,
        task: GenerationTask,
        update_progress: Callable[[int, int, str], None],
        log_artifact: Callable[[str, str, str, str | None], None]
    ) -> None:
        """
        Execute the task.

        Args:
            task: The task to execute (with parsed payload)
            update_progress: Callback to update progress (current, total, message)
            log_artifact: Callback to log created artifacts (entity_type, entity_id, action, previous_data)

        Raises:
            Exception: On failure (will trigger retry logic)
        """
        pass
```

### Handler Registry

```python
class TaskHandlerRegistry:
    """Registry for task handlers - allows dynamic registration."""

    _handlers: dict[str, type[TaskHandler]] = {}

    @classmethod
    def register(cls, task_type: str):
        """Decorator to register a handler for a task type."""
        def decorator(handler_class: type[TaskHandler]):
            cls._handlers[task_type] = handler_class
            return handler_class
        return decorator

    @classmethod
    def get_handler(cls, task_type: str) -> TaskHandler:
        """Get handler instance for a task type."""
        if task_type not in cls._handlers:
            raise ValueError(f"No handler registered for task type: {task_type}")
        return cls._handlers[task_type]()
```

### Polling Loop

```python
async def run_task_loop():
    """Main polling loop - runs in background thread."""
    while not shutdown_event.is_set():
        try:
            # 1. Hole nächsten ausführbaren Task
            task = await get_next_pending_task()

            if task:
                # 2. Markiere als in_progress
                await mark_task_in_progress(task.id)

                # 3. Hole Handler und führe aus
                handler = TaskHandlerRegistry.get_handler(task.task_type)

                try:
                    await handler.run(task, update_progress_callback, log_artifact_callback)
                    await mark_task_completed(task.id)
                except Exception as e:
                    await handle_task_failure(task, e)
            else:
                # Kein Task verfügbar - warte
                await asyncio.sleep(POLL_INTERVAL)

        except Exception as e:
            logger.error(f"Task loop error: {e}")
            await asyncio.sleep(POLL_INTERVAL)
```

### Heartbeat Mechanismus

```python
HEARTBEAT_INTERVAL = 30  # Sekunden
HEARTBEAT_TIMEOUT = 90   # Sekunden - Task gilt als "stuck"

async def heartbeat_loop(task_id: str, stop_event: asyncio.Event):
    """Sends periodic heartbeats while task is running."""
    while not stop_event.is_set():
        await update_heartbeat(task_id)
        await asyncio.sleep(HEARTBEAT_INTERVAL)

async def check_stuck_tasks():
    """
    Prüft auf Tasks die keine Heartbeats mehr senden.
    Wird periodisch vom Task Runner aufgerufen.
    """
    stuck_tasks = await get_tasks_with_stale_heartbeat(HEARTBEAT_TIMEOUT)
    for task in stuck_tasks:
        if task.retry_count < task.max_retries:
            await reset_task_for_retry(task.id)
        else:
            await mark_task_failed(task.id, "Task timed out (no heartbeat)")
```

---

## Accept/Revert Workflow

### Konzept

Nach Abschluss eines Tasks kann der User:
1. **Accept**: Bestätigt, dass die generierten Inhalte gut sind
2. **Revert**: Macht alle Änderungen rückgängig

```
┌──────────┐     Task      ┌───────────┐     Accept     ┌──────────┐
│ pending  │────läuft─────▶│ completed │───────────────▶│ accepted │
└──────────┘               └───────────┘                └──────────┘
                                 │
                                 │ Revert
                                 ▼
                           ┌───────────┐
                           │ reverted  │
                           └───────────┘
```

### Revert-Logik

```python
async def revert_task(task_id: str):
    """
    Macht alle Änderungen eines Tasks rückgängig.
    Verwendet task_content_log für Rollback.
    """
    # 1. Hole alle Artefakte in umgekehrter Reihenfolge
    artifacts = await get_task_artifacts(task_id, order_by="created_at DESC")

    for artifact in artifacts:
        if artifact.action == "created":
            # Lösche das erstellte Objekt
            await delete_entity(artifact.entity_type, artifact.entity_id)

        elif artifact.action == "updated":
            # Stelle vorherigen Zustand wieder her
            await restore_entity(artifact.entity_type, artifact.entity_id, artifact.previous_data)

        elif artifact.action == "deleted":
            # Stelle gelöschtes Objekt wieder her
            await recreate_entity(artifact.entity_type, artifact.previous_data)

    # 2. Markiere Task als reverted
    await update_task(task_id, reverted_at=datetime.now())
```

---

## Circuit Breaker

Globaler Circuit Breaker für LLM-Aufrufe - verhindert kaskadierende Fehler bei Provider-Problemen.

### Zustände

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
          │
          │ Fehler
          ▼
     ┌─────────┐
     │  OPEN   │
     └─────────┘
```

### Konfiguration

```python
CIRCUIT_BREAKER_CONFIG = {
    "failure_threshold": 5,      # Fehler bis OPEN
    "success_threshold": 2,      # Erfolge in HALF-OPEN bis CLOSED
    "timeout_seconds": 60,       # Zeit in OPEN bis HALF-OPEN
}
```

### Integration

Der Circuit Breaker wird im LLM-Client verwendet und ist **global** für alle Tasks:

```python
class LLMClient:
    circuit_breaker = CircuitBreaker(**CIRCUIT_BREAKER_CONFIG)

    async def call(self, prompt: str, model: str) -> str:
        if self.circuit_breaker.is_open:
            raise CircuitOpenError("LLM circuit breaker is open")

        try:
            result = await self._make_request(prompt, model)
            self.circuit_breaker.record_success()
            return result
        except Exception as e:
            self.circuit_breaker.record_failure()
            raise
```

### UI-Integration

Bei offenem Circuit Breaker zeigt das UI:
- "Service temporarily unavailable"
- Geschätzte Zeit bis Retry möglich

---

## Retry-Logik

### Exponentieller Backoff

```python
def calculate_retry_delay(retry_count: int) -> int:
    """
    Berechnet Wartezeit bis zum nächsten Retry.

    retry_count=0: 10 Sekunden
    retry_count=1: 20 Sekunden
    retry_count=2: 40 Sekunden
    ...
    Max: 5 Minuten
    """
    base_delay = 10
    max_delay = 300
    delay = base_delay * (2 ** retry_count)
    return min(delay, max_delay)
```

### Retry-Verhalten

1. Task schlägt fehl
2. `retry_count` wird erhöht
3. Wenn `retry_count < max_retries`:
   - Task-Status zurück auf `pending`
   - `delayed_until` = now + exponentieller Backoff
4. Wenn `retry_count >= max_retries`:
   - Task-Status auf `failed`
   - `error_message` wird gesetzt

---

## API Endpoints

### Task-Management

| Endpoint | Method | Beschreibung |
|----------|--------|--------------|
| `/tasks` | GET | Liste aller Tasks (mit Filter: status, task_type) |
| `/tasks/{id}` | GET | Task-Details inkl. Content-Log |
| `/tasks` | POST | Neuen Task erstellen |
| `/tasks/{id}/cancel` | POST | Task abbrechen |
| `/tasks/{id}/retry` | POST | Fehlgeschlagenen Task neu starten |
| `/tasks/{id}/accept` | POST | Task-Ergebnisse bestätigen |
| `/tasks/{id}/revert` | POST | Alle Task-Änderungen rückgängig machen |

### Request/Response Beispiele

**Task erstellen:**
```json
POST /tasks
{
    "task_type": "generate_clusters",
    "payload": {
        "subject_id": "uuid-here",
        "count": 10,
        "variants_per_cluster": 5
    },
    "user_context": "Fokus auf Anwendungsaufgaben aus dem Alltag"
}

Response:
{
    "id": "uuid",
    "task_type": "generate_clusters",
    "status": "pending",
    "created_at": "2025-01-15T10:00:00Z"
}
```

**Task-Status:**
```json
GET /tasks/{id}
{
    "id": "uuid",
    "task_type": "generate_clusters",
    "status": "in_progress",
    "progress_current": 3,
    "progress_total": 10,
    "progress_message": "Generating cluster 4 of 10...",
    "retry_count": 0,
    "max_retries": 3,
    "created_at": "2025-01-15T10:00:00Z",
    "started_at": "2025-01-15T10:00:05Z",
    "accepted_at": null,
    "reverted_at": null,
    "content_log": [
        { "entity_type": "cluster", "entity_id": "uuid-1", "action": "created" },
        { "entity_type": "cluster", "entity_id": "uuid-2", "action": "created" },
        { "entity_type": "cluster", "entity_id": "uuid-3", "action": "created" }
    ]
}
```

**Task akzeptieren:**
```json
POST /tasks/{id}/accept

Response:
{
    "id": "uuid",
    "status": "completed",
    "accepted_at": "2025-01-15T10:05:00Z"
}
```

**Task rückgängig machen:**
```json
POST /tasks/{id}/revert

Response:
{
    "id": "uuid",
    "status": "completed",
    "reverted_at": "2025-01-15T10:05:00Z",
    "reverted_count": {
        "clusters": 3,
        "variants": 15,
        "answers": 60
    }
}
```

---

## Concurrency & Locking

### Aktuelle Strategie (Phase 1)

- **Ein Task zur Zeit**: Einfachste Lösung, keine Race Conditions
- Polling-Loop verarbeitet Tasks sequentiell
- Kein explizites Locking nötig

### Zukünftige Erweiterung (Optional)

Bei Bedarf für parallele Task-Ausführung:

1. **Optimistic Locking** beim Task-Claim:
   ```sql
   UPDATE generation_tasks
   SET status = 'in_progress', started_at = NOW()
   WHERE id = ? AND status = 'pending'
   ```

2. **Row-Level Locking** (bei PostgreSQL/Supabase):
   ```sql
   SELECT * FROM generation_tasks
   WHERE status = 'pending'
   ORDER BY created_at
   LIMIT 1
   FOR UPDATE SKIP LOCKED
   ```

---

## Konfiguration

```python
TASK_RUNNER_CONFIG = {
    # Polling
    "poll_interval_seconds": 5,

    # Heartbeat
    "heartbeat_interval_seconds": 30,
    "heartbeat_timeout_seconds": 90,

    # Retry
    "default_max_retries": 3,
    "retry_base_delay_seconds": 10,
    "retry_max_delay_seconds": 300,

    # Parallelität (Phase 1: 1)
    "max_concurrent_tasks": 1,
}
```

---

## Implementierungs-Reihenfolge

### Phase 1: Basis-Infrastruktur
1. DB-Migration für `generation_tasks` und `task_content_log`
2. Pydantic-Models für Tasks
3. Task-Repository (CRUD)
4. API-Endpoints für Tasks (inkl. accept/revert)

### Phase 2: Task Runner
1. TaskHandler Interface & Registry
2. Stub-Handler für Tests (simuliert Arbeit)
3. Polling-Loop als Background-Thread
4. Heartbeat-Mechanismus

### Phase 3: Resilience
1. Circuit Breaker Implementation
2. Retry-Logik mit exponentiellem Backoff
3. Stuck-Task Detection

### Phase 4: LLM Integration
1. LLM-Client mit Circuit Breaker
2. `llm_usage_log` Tabelle
3. Echte Handler-Implementierungen

---

## Offene Punkte für spätere Iterationen

- **Task-Priorisierung**: Aktuell FIFO, später ggf. Prioritäts-Queue
- **Bulk-Operationen**: Mehrere Tasks auf einmal erstellen
- **Notifications**: WebSocket/SSE für Live-Updates im UI
- **Task-History Cleanup**: Alte abgeschlossene Tasks archivieren/löschen
- **Metrics/Monitoring**: Prometheus-Metriken für Task-Durchsatz
- **LLM-Kosten-Dashboard**: Admin-Widget für "Kosten diesen Monat: X€"
