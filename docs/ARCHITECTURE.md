# MindForge Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Games (Various)                         │
│      (Dungeons & Diplomas first, more planned)          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ↓
┌─────────────────────────────────────────────────────────┐
│              MindForge Backend (Python)                  │
│                    FastAPI                              │
├─────────────────────────────────────────────────────────┤
│  ├─ Authentication API (accounts, sessions, JWT)       │
│  ├─ Content API (questions, answers, variants)         │
│  ├─ Learner API (profiles, progress, KST mapping)      │
│  ├─ Event Logging (stealth assessment, raw data)       │
│  ├─ Task Management (background job runner)            │
│  └─ LLM Integration (content generation)               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│            PostgreSQL Database                          │
│         (Hetzner managed, replicated)                   │
├─────────────────────────────────────────────────────────┤
│  Users | Subjects | Clusters | Variants | Answers      │
│  Events (all questions/answers) | LLM Usage | Tasks    │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Infrastructure (Hetzner + Kubernetes)

### Physical Architecture

**Hosting:** Hetzner (German data center, no U.S. jurisdiction)

**Current Setup:**
- 1 K3s cluster (single node, non-HA) on virtual machine
- PostgreSQL database (non-HA, can upgrade later)
- Docker registry (private, on-cluster)
- SSL/TLS with Let's Encrypt

**Future Upgrade Path:**
- 2+ nodes for redundancy
- PostgreSQL HA with replication
- Regional failover (Hetzner supports multi-region)

### Kubernetes (K3s) Configuration

**Namespaces** (logical separation, single cluster):
```
kube-system/          # K3s internal
default/              # System services, databases
mindforge-prod/       # MindForge backend & auth
mindforge-admin/      # Admin UI (if separate)
d-and-d/              # Dungeons & Diplomas game
```

**Why separate namespaces?**
- Isolation (can scale independently)
- Network policies (restrict cross-namespace traffic if needed)
- Easy to "lift and shift" to separate cluster later
- RBAC isolation for different teams

### Domain Configuration

**Dogado (DNS Provider):**
- `mindforge.de` → K3s ingress (MindForge backend + auth)
- `dungeons-diplomas.de` → K3s ingress (D&D frontend)
- SSL certificates via Let's Encrypt (auto-renewal)

---

## 2. Backend Architecture (Python FastAPI)

### Deployment

**Container:** Docker image built from `apps/backend/Dockerfile`
**Orchestration:** K3s Deployment + Service + Ingress
**Replicas:** 1 (Beta), scale to 3+ for production
**Health checks:** Liveness probe, readiness probe

### API Structure

**Base:** `POST /api/v1/...`

#### Authentication Endpoints
```
POST   /api/v1/auth/register          # Create user account
POST   /api/v1/auth/login             # Get JWT token
POST   /api/v1/auth/refresh           # Refresh token
POST   /api/v1/auth/logout            # Invalidate token
POST   /api/v1/auth/password-reset    # Initiate reset
```

#### Content Endpoints
```
GET    /api/v1/subjects               # List all subjects
GET    /api/v1/subjects/{id}/clusters # Questions for subject
GET    /api/v1/questions              # Paginated question list
GET    /api/v1/questions/{id}         # Single question + variants
GET    /api/v1/answers                # Possible answers (used for shuffling)
```

#### Learning/Assessment Endpoints
```
GET    /api/v1/learners/me            # Current user profile
GET    /api/v1/learners/me/progress   # KST mapping & progress
POST   /api/v1/events/answer          # Log an answer (stealth assessment)
GET    /api/v1/stats/me               # User statistics
```

#### Admin Endpoints (protected, requires auth)
```
POST   /api/v1/admin/questions        # Create question
PUT    /api/v1/admin/questions/{id}   # Update question
DELETE /api/v1/admin/questions/{id}   # Delete question
POST   /api/v1/admin/tasks            # Trigger content generation
GET    /api/v1/admin/tasks/{id}       # Task status
```

### Authentication & Authorization

**Token-based:**
- JWT (JSON Web Tokens) issued on login
- Tokens include: user_id, roles, expiration
- Refresh tokens for extended sessions

**Roles:**
- `user` - Can answer questions, view own progress
- `editor` - Can create/edit content
- `admin` - Can manage users, system config

### Event Sourcing & Logging

**Core Principle:** Append-only event log for all learning activities

**Events captured:**
```json
{
  "event_type": "question_answered",
  "user_id": "uuid",
  "timestamp": "2026-02-03T10:30:00Z",
  "question_id": "uuid",
  "question_text": "What is 2+2?",
  "correct_answer_index": 2,
  "user_selected_index": 2,
  "is_correct": true,
  "response_time_ms": 3400,
  "answer_variants": ["3", "4", "5", "6"],
  "context": {
    "subject": "Mathematik",
    "cluster": "Addition",
    "session_id": "uuid",
    "device": "mobile",
    "game": "dungeons_diplomas"
  }
}
```

**Storage:** PostgreSQL `events` table (immutable append-only)

**Why Event Sourcing?**
- Full audit trail (can never lose data)
- AI analysis needs complete history
- Can replay events for debugging
- GDPR-compatible (append-only, clear retention)

### Task Management System

**Purpose:** Background jobs for content generation, analysis, etc.

**Components:**
1. **Task Queue** (PostgreSQL table)
2. **Task Runner** (Python background process)
3. **Handler Registry** (pluggable task types)
4. **Circuit Breaker** (protect from cascading failures)

**Example Task:**
```
Type: generate_questions
Status: pending
Input: {"subject_id": "...", "count": 10}
Handler: LLMQuestionGenerator
Max retries: 3
Created: 2026-02-03 10:00:00
```

**Task Lifecycle:**
```
pending → processing → completed
   ↓                      ↑
   └──── failed ←─────────┘
         (retry with backoff)
```

**Retry Logic:**
- Exponential backoff: 10s, 20s, 40s, 80s, 160s (max 5 min)
- Max 3 retries per task
- Heartbeat timeout: 90 seconds (detects stuck tasks)

**Circuit Breaker Pattern:**
```
States:
  CLOSED     → Normal (requests pass through)
  OPEN       → Failing (requests fail fast)
  HALF_OPEN  → Testing (single request to check recovery)

Triggers:
  - 5 consecutive failures → OPEN
  - 60 seconds in OPEN → HALF_OPEN
  - Success in HALF_OPEN → CLOSED
  - Failure in HALF_OPEN → OPEN
```

---

## 3. Database Schema

**Note:** Full schema in `docs/architecture/database-schema.md`. Here's overview:

### Core Tables

| Table | Purpose | Notes |
|-------|---------|-------|
| `users` | User accounts | UUID PK, timestamps |
| `subjects` | Learning domains (Math, Chemistry, etc.) | Defined in seeds |
| `question_clusters` | Groups of related questions | Hierarchical grouping |
| `question_variants` | Individual questions | Multiple variants per cluster |
| `answers` | Possible answer options | One per variant, shuffled in UI |
| `events` | All learning activity | Immutable append-only log |
| `learner_profiles` | KST mappings & progress | Computed from events |
| `tasks` | Background job queue | For content generation |
| `llm_usage` | Cost tracking | Provider, model, tokens |

### Key Design Decisions

**UUIDs everywhere:** Distributed systems ready, privacy-friendly (no sequential IDs)

**Timestamps:** ISO 8601 strings (YYYY-MM-DDTHH:MM:SSZ)

**Soft deletes:** `deleted_at` column (preserve history, GDPR retention)

**Indices:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_clusters_subject ON question_clusters(subject_id);
CREATE INDEX idx_variants_cluster ON question_variants(cluster_id);
```

### Migration Strategy

**Development (SQLite):**
```bash
python -m packages.db.init
python -m packages.db.migrate
```

**Production (PostgreSQL on Hetzner):**
```bash
# Via Kubernetes:
kubectl exec -it mindforge-backend -- \
  python -m packages.db.migrate --db-url=postgresql://...
```

---

## 4. Admin UI (Next.js React)

**Note:** Full UI spec in `docs/architecture/admin-ui.md`

### Deployment

**Container:** Docker image built from `apps/admin/Dockerfile`
**Deployment:** K3s Deployment + Service + Ingress
**Environment variables:**
```
NEXT_PUBLIC_API_URL=https://mindforge.de/api/v1
NEXT_PUBLIC_AUTH_MOCK=false (Beta: can be true for testing)
```

### Architecture

**Framework:** Next.js 16 + React 19
**Styling:** Tailwind CSS v4 + Dark/Light modes
**UI Components:** shadcn/ui (50+ components)
**Forms:** React Hook Form + Zod validation
**State:** React Context API (auth, content, tasks)
**Notifications:** Sonner toasts

### Protected Routes

```
/                          # Public landing (future)
/auth/login                # Public login
/auth/register             # Public register

(protected)/
  /dashboard               # Main dashboard
  /content                 # Question editor
  /tasks                   # Background task monitor
  /settings                # User settings
```

### Design System

| Element | Value |
|---------|-------|
| Primary Color | #FF6D00 (orange) |
| Text | Inter font |
| Dark mode | #1a1a1a (near black) |
| Light mode | #ffffff |
| Spacing | Tailwind defaults (4px grid) |
| Breakpoints | sm(640), md(768), lg(1024), xl(1280), 2xl(1536) |
| Touch targets | 44x44px minimum |
| Transitions | 150-300ms (smooth, not jarring) |

---

## 5. Dungeons & Diplomas Integration

### How D&D Connects

**Registration Flow:**
```
1. User starts D&D game
2. Prompted: "Create account"
3. User enters: username, email, password
4. D&D calls: POST /api/v1/auth/register (MindForge backend)
5. Gets back: JWT token + user profile
6. D&D stores token locally (browser localStorage)
7. All subsequent requests: Bearer token in Authorization header
```

**Stealth Assessment Flow:**
```
1. Combat encounter starts
2. D&D loads questions from: GET /api/v1/questions (paginated)
3. Player answers question in combat
4. D&D sends: POST /api/v1/events/answer
   └─ Includes: question_id, user_selection, response_time_ms, etc.
5. MindForge backend:
   └─ Logs event (append to events table)
   └─ Updates learner profile (KST calculation)
   └─ Returns: "correct=true/false"
6. D&D updates game state (boss health, player gold, etc.)
```

**Difficulty Adaptation (Future):**
```
1. Boss starts encounter
2. D&D calls: GET /api/v1/learners/me/progress
3. MindForge returns: KST profile + difficulty ratings
4. D&D selects question matching:
   └─ difficulty = 11 - boss_level (hardness 0-10)
5. Question is edge of learner's knowledge
```

### API Contract for D&D

See `docs/architecture/admin-ui.md` section "API Endpoints for Game Integration"

---

## 6. LLM Integration Architecture

### Current State (Beta)

**Implementation:** Stub handlers (mock question generation)

```python
class StubQuestionGenerator:
    async def generate(self, subject_id: str, count: int):
        return [
            {
                "question": "Mock question about " + subject,
                "answers": ["Option A", "Option B", "Option C", "Option D"],
                "correct_index": 0,
            }
            # ... repeat count times
        ]
```

### Planned (After Beta)

**Multi-provider support:**
```python
# Provider abstraction
class LLMProvider(ABC):
    async def generate_question(self, prompt: str) -> Dict:
        pass

class OpenAIProvider(LLMProvider):
    async def generate_question(self, prompt: str):
        # Use GPT-4 or similar
        pass

class OpenRouterProvider(LLMProvider):
    async def generate_question(self, prompt: str):
        # Use OpenRouter API (supports multiple models)
        pass
```

### Cost Tracking

**llm_usage table:**
```sql
CREATE TABLE llm_usage (
  id UUID PRIMARY KEY,
  task_id UUID,
  provider TEXT,           -- 'openai', 'openrouter', etc.
  model TEXT,              -- 'gpt-4', 'claude-3', etc.
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  cost_usd DECIMAL(10,6),
  timestamp TIMESTAMP
);
```

---

## 7. Data Privacy & Security

### GDPR Compliance

- ✅ User consent on registration
- ✅ Data exports (full user data on request)
- ✅ Account deletion (soft delete, 30-day grace period)
- ✅ Minimal PII (email + hashed password only)
- ✅ Clear retention policies (events kept 2 years, then purged)

### Cloud Act Mitigation

**Goal:** No U.S. company should have access to student data

- ✅ Hetzner (German data center)
- ✅ PostgreSQL (open source, no vendor lock-in)
- ✅ Kubernetes (portable, run anywhere)
- ✅ Let's Encrypt (open-source SSL)
- ✅ No AWS, Google Cloud, Azure, Vercel

### Encryption

- **In transit:** TLS 1.3 (automatic via Let's Encrypt)
- **At rest:** PostgreSQL encryption (planned for Phase 2)
- **Secrets:** K3s Secrets (encrypted at rest)

---

## 8. CI/CD Pipeline

### GitHub → Docker Registry → K3s

**Tools:**
- GitHub Actions (CI/CD orchestration)
- Docker (container images)
- Private Docker Registry (on-cluster)
- K3s (deployment target)

**Pipeline (per repo):**

```yaml
on: push to main

1. Build Docker image
   └─ Tag: ghcr.io/user/mindforge:main-{commit-sha}

2. Push to registry
   └─ Authenticate with GitHub Secrets

3. Update K3s deployment
   └─ kubectl set image deployment/mindforge ...
   └─ K3s pulls new image from registry
   └─ Automatic rollout (or manual approval for prod)
```

**Secrets Management:**
- GitHub Secrets stores: DB passwords, API keys, registry creds
- GitHub Actions passes to K3s as environment variables
- K3s stores as native Kubernetes Secrets
- Pods inject via `envFrom`

---

## 9. Monitoring & Observability (Beta: Minimal)

**For Beta:** Simple logging sufficient

**For Production (Phase 2):**
- Prometheus (metrics collection)
- Grafana (dashboards)
- ELK Stack or Loki (log aggregation)
- Alerts for: API errors, task failures, database size

---

## 10. Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Hosting** | Hetzner + K3s | Latest stable |
| **Container Runtime** | Docker | 24+ |
| **Orchestration** | Kubernetes (K3s) | 1.27+ |
| **Database** | PostgreSQL | 15+ |
| **Backend** | Python FastAPI | 3.10+ |
| **Frontend** | Next.js | 16+ |
| **UI Framework** | React | 19+ |
| **Styling** | Tailwind CSS | 4+ |
| **Package Manager** | npm (frontend), pip (backend) | Latest |

---

## 11. Known Limitations & Future Improvements

### Beta Limitations

- ✅ Single K3s node (no redundancy)
- ✅ PostgreSQL non-HA (single replica)
- ✅ Stub LLM handlers (no real content generation yet)
- ✅ No monitoring/alerting
- ✅ Manual backups (no automated disaster recovery)

### Post-Beta Roadmap

- [ ] Add K3s nodes for high availability
- [ ] PostgreSQL with streaming replication
- [ ] Automated backups to Hetzner Storage
- [ ] Real LLM integration (OpenAI, OpenRouter)
- [ ] Monitoring stack (Prometheus + Grafana)
- [ ] CDN for static assets (Hetzner CDN or Bunny)
- [ ] WebSocket support for real-time updates
- [ ] Database connection pooling (PgBouncer)

---

## 12. Key Files & Quick Reference

| File | Purpose |
|------|---------|
| `apps/backend/Dockerfile` | Backend container image |
| `apps/admin/Dockerfile` | Frontend container image |
| `packages/db/migrations/` | Database migrations (SQLite + PostgreSQL) |
| `docs/architecture/database-schema.md` | Full database schema |
| `docs/architecture/admin-ui.md` | UI specifications & design |
| `docs/architecture/task-management.md` | Task system architecture |

---

## References

- **Knowledge Space Theory:** Doignon & Falmagne (1999) - Mathematical foundation for adaptive learning
- **Bloom's 2-Sigma Problem:** Bloom (1984) - Why one-on-one tutoring works
- **Event Sourcing:** Event-Driven Architecture pattern
- **Circuit Breaker:** Release It! (Michael Nygard)

---

*Last updated: February 3, 2026*
*Team: Tobias (DevOps lead), Michi (game dev), Tim (support)*
