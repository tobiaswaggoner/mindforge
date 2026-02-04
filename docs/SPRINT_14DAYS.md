# 14-Day Beta Launch Sprint

**Goal:** Ship a working MindForge backend + D&D integration for beta users
**Timeline:** February 3-16, 2026
**Team:** Tobias (5h/week), Michi (15h/week), Tim (6h/week) = 26 hours
**Success Criteria:** See end of document

---

## Sprint Overview

**Three parallel workstreams:**
1. **Tobias (DevOps/Backend)** - Infrastructure, auth backend, deployment
2. **Michi (Frontend/Game)** - D&D finalization, integration with backend
3. **Tim (Frontend/Support)** - D&D polish, testing, bug fixes

**Critical path:** MindForge auth backend must be first (blocks D&D integration)

---

## Days 1-3: Foundation & Setup

### Day 1 (Feb 3, Monday)

**Tobias (2h):**
- [ ] Verify K3s cluster health, PostgreSQL connectivity
- [ ] Create Kubernetes namespaces: `mindforge-prod`, `d-and-d`
- [ ] Set up Docker registry authentication
- [ ] Reserve domains: `mindforge.de`, `dungeons-diplomas.de` (via Dogado)
- [ ] Initial Let's Encrypt certificate request

**Michi (3h):**
- [ ] Review current D&D state, create task list of remaining features
- [ ] Identify which 5-7 features must be finalized (no new features allowed)
- [ ] Start on feature #1 (document scope)

**Tim (2h):**
- [ ] Set up local dev environment (D&D repo)
- [ ] Run D&D locally, identify any broken builds
- [ ] Document blockers

**Deliverables:** Infrastructure ready, domain reserved, D&D current state documented

---

### Day 2 (Feb 4, Tuesday)

**Tobias (2.5h):**
- [ ] Create Python FastAPI project structure in `apps/backend`
  ```
  apps/backend/
  ├── src/
  │   ├── api/
  │   │   └── routes/auth.py     # register, login, refresh
  │   ├── core/
  │   │   ├── config.py
  │   │   └── security.py        # JWT, password hashing
  │   ├── models/
  │   │   └── user.py
  │   ├── db/
  │   │   ├── database.py        # PostgreSQL connection
  │   │   └── migrations.py
  │   └── main.py
  ├── requirements.txt
  ├── Dockerfile
  └── .env.example
  ```
- [ ] Install dependencies: FastAPI, SQLAlchemy, psycopg2, pydantic, JWT
- [ ] Write database connection code (PostgreSQL)

**Michi (3h):**
- [ ] Finalize feature #1
- [ ] Start feature #2

**Tim (2h):**
- [ ] Document D&D API endpoints needed from MindForge
- [ ] Create test user stories for integration

**Deliverables:** Backend skeleton ready, DB connection working

---

### Day 3 (Feb 5, Wednesday)

**Tobias (2h):**
- [ ] Write first database migration (users table)
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] Implement JWT token generation/validation
- [ ] Create `POST /auth/register` endpoint (basic validation)

**Michi (4h):**
- [ ] Finalize features #2 & #3
- [ ] Start integration scaffolding (D&D calls MindForge endpoint)

**Tim (6h) (Wednesday focus day):**
- [ ] Help Michi with feature #2
- [ ] Set up test cases for integration

**Deliverables:** First auth endpoint working, can register users

---

## Days 4-7: Core Backend & Integration

### Day 4 (Feb 6, Thursday)

**Tobias (2h):**
- [ ] Implement `POST /auth/login` endpoint (username + password validation)
- [ ] Write Dockerfile for backend
- [ ] Create K3s deployment manifests (Deployment + Service + Ingress)

**Michi (4h):**
- [ ] Finalize features #4 & #5
- [ ] Begin D&D → MindForge token flow (localStorage)

**Tim (2h):**
- [ ] Help Michi with feature #4

**Deliverables:** Login endpoint working, backend containerized

---

### Day 5 (Feb 7, Friday)

**Tobias (2h):**
- [ ] Set up GitHub Actions workflow
  ```yaml
  # on push to main:
  # 1. Build backend Docker image
  # 2. Push to K3s registry
  # 3. Update K3s deployment (rollout)
  ```
- [ ] Test CI/CD pipeline (deploy dummy app)

**Michi (3h):**
- [ ] Finalize feature #6
- [ ] Integration: D&D login form calls `POST /api/v1/auth/register`

**Tim (0h):** (Off day)

**Deliverables:** CI/CD pipeline working, D&D can register users in MindForge

---

### Day 6 (Feb 8, Saturday - Optional Buffer)

**Tobias (1h):**
- [ ] Configure domains in Dogado (DNS pointing to K3s ingress)
- [ ] Set up SSL with Let's Encrypt
- [ ] Test HTTPS endpoints

**Michi (2h):**
- [ ] Finalize feature #7 (last feature allowed)
- [ ] Test D&D full registration/login flow

**Tim (0h):**

**Deliverables:** HTTPS working, domain functional

---

### Day 7 (Feb 9, Sunday - Optional Buffer)

**Tobias (0.5h):**
- [ ] Database backup strategy (manual script for now)

**Michi (2h):**
- [ ] D&D bug fixes & polish

**Tim (2h):**
- [ ] End-to-end testing (register, login, play game)

**Deliverables:** System stable, no critical bugs

---

## Days 8-10: Events & Stealth Assessment

### Day 8 (Feb 10, Monday)

**Tobias (2h):**
- [ ] Create events table migration
  ```sql
  CREATE TABLE events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(50),       -- 'question_answered'
    user_id UUID NOT NULL,
    question_id UUID,
    is_correct BOOLEAN,
    response_time_ms INT,
    timestamp TIMESTAMP DEFAULT NOW(),
    context JSONB,                -- question text, subject, etc.
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  ```
- [ ] Create events API: `POST /api/v1/events/answer`

**Michi (4h):**
- [ ] D&D: Integrate event logging
  - After player answers → POST /events/answer
  - Include: question_id, selected_index, response_time_ms, is_correct

**Tim (2h):**
- [ ] Help Michi with logging implementation

**Deliverables:** Events API working, D&D sending events

---

### Day 9 (Feb 11, Tuesday)

**Tobias (2.5h):**
- [ ] Create learner_profiles table (KST placeholder for now)
  ```sql
  CREATE TABLE learner_profiles (
    user_id UUID PRIMARY KEY,
    total_questions_attempted INT DEFAULT 0,
    total_correct INT DEFAULT 0,
    accuracy DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  ```
- [ ] Implement basic stats aggregation (update on each event)
- [ ] Create `GET /api/v1/learners/me/progress` endpoint

**Michi (3h):**
- [ ] Complete event logging integration
- [ ] Test full flow: register → answer question → verify in backend

**Tim (2h):**
- [ ] Write integration test script (register + answer question)

**Deliverables:** Event logging + stats endpoint working

---

### Day 10 (Feb 12, Wednesday)

**Tobias (1.5h):**
- [ ] Create sample data seeding (10 subjects, 50 questions, 5 clusters)
  ```python
  # Script: seed_data.py
  # INSERT INTO subjects (id, name) VALUES (...)
  # INSERT INTO question_clusters...
  # etc.
  ```
- [ ] Document how to seed database for new deployments

**Michi (4h):**
- [ ] D&D: Load questions from backend
  - GET /api/v1/questions (paginated)
  - Shuffle answers
  - Display in combat

**Tim (6h):**
- [ ] Help Michi with question loading
- [ ] Full end-to-end test: register → combat → answer questions → verify stats

**Deliverables:** Sample questions loaded, D&D combat with real questions

---

## Days 11-13: Polish & Deployment

### Day 11 (Feb 13, Thursday)

**Tobias (2.5h):**
- [ ] Create Kubernetes secrets for database connection
  ```bash
  kubectl create secret generic mindforge-db \
    --from-literal=DATABASE_URL="postgresql://..."
  ```
- [ ] Update K3s deployment manifests to use secrets
- [ ] Test deployment on Hetzner K3s cluster
- [ ] Fix any networking/DNS issues

**Michi (3h):**
- [ ] D&D polish: error handling, loading states, UI feedback
- [ ] Test authentication refresh (token expiration)

**Tim (2h):**
- [ ] Help Michi with error handling

**Deliverables:** Backend deployed to Hetzner, accessible via domain

---

### Day 12 (Feb 14, Friday)

**Tobias (2h):**
- [ ] Monitor deployed system
- [ ] Fix any production bugs
- [ ] Document deployment procedures (how to deploy future changes)
- [ ] Create runbook: "How to rollback if deployment fails"

**Michi (3h):**
- [ ] Final D&D testing on production backend
- [ ] Fix any integration issues
- [ ] Test on mobile (responsive)

**Tim (0h):** (Off day)

**Deliverables:** System stable on production, ready for beta users

---

### Day 13 (Feb 15, Saturday - Optional)

**Tobias (1h):**
- [ ] Verify backups working
- [ ] Create status dashboard (simple page showing system health)

**Michi (2h):**
- [ ] Final polish & bug fixes
- [ ] Prepare beta user testing plan (who, what to test)

**Tim (2h):**
- [ ] Help Michi with final testing

**Deliverables:** Ready for beta launch

---

## Day 14: Launch & Validation

### Day 14 (Feb 16, Sunday - Launch Day)

**Tobias (1h):**
- [ ] Monitor logs, check for errors
- [ ] Be on-call for critical issues

**Michi (2h):**
- [ ] Onboard first beta users (5-10 test accounts)
- [ ] Walk through: register, login, answer questions, check stats
- [ ] Document any bugs

**Tim (2h):**
- [ ] Test as beta user
- [ ] Verify event logging works
- [ ] Check database for sample data

**Deliverables:** Beta launched, users can register and play

---

## Critical Path & Dependencies

```
Day 1-2: Infrastructure setup
   ↓
Day 2-3: Auth backend (register/login)
   ↓
Day 4-5: D&D integration with auth
   ↓
Day 8-9: Event logging
   ↓
Day 11: Deploy to production
   ↓
Day 14: Beta launch
```

**Cannot start earlier:** Each phase depends on previous

---

## AI-Assisted Development Strategy

### What to Delegate to AI

1. **Boilerplate code generation**
   - FastAPI CRUD endpoints (simple patterns)
   - Docker/K3s manifests (reusable templates)
   - Database migrations (SQL structure)
   - GitHub Actions workflows

2. **Documentation**
   - API endpoint documentation
   - Runbooks & deployment guides
   - Troubleshooting guides

3. **Testing**
   - Integration test scaffolding
   - Mock data generation
   - Test case design

### What to Do Manually

1. **Architecture decisions** (Tobias)
2. **Security implementations** (password hashing, JWT validation)
3. **Integration points** (D&D ↔ MindForge API contract)
4. **Debugging production issues** (requires deep knowledge)

### Time Estimates (with AI assistance)

| Task | Estimate | Notes |
|------|----------|-------|
| Auth backend | 4-5 hours | AI generates endpoints, Tobias validates |
| Event logging | 2-3 hours | Schema simple, implementation straightforward |
| Kubernetes setup | 1-2 hours | Manifests from templates |
| D&D integration | 4-5 hours | Most complex, requires careful testing |
| Testing & polish | 3-4 hours | Bug fixes, manual verification |
| **Total** | **14-19 hours** | Depends on issues found |

---

## Success Criteria (Day 14)

### Must-Have (Blocker Issues)

- ✅ `POST /api/v1/auth/register` works (create user accounts)
- ✅ `POST /api/v1/auth/login` works (issue JWT tokens)
- ✅ D&D can register users via MindForge auth
- ✅ D&D can log in users via MindForge auth
- ✅ `GET /api/v1/questions` returns questions (at least 10)
- ✅ `POST /api/v1/events/answer` logs answers to database
- ✅ `GET /api/v1/learners/me/progress` returns user stats
- ✅ System deployed on Hetzner K3s with HTTPS
- ✅ Domain (mindforge.de) resolves and works
- ✅ No critical security issues (passwords hashed, JWT valid)

### Should-Have (Nice-To-Have)

- ⚠️ `POST /api/v1/auth/refresh` works (token refresh)
- ⚠️ Multiple subjects/questions (more than 10)
- ⚠️ Error handling for invalid requests
- ⚠️ Automated CI/CD deployment working
- ⚠️ Basic monitoring (logs accessible)

### Nice-To-Have (Can Skip)

- ❌ Advanced KST mapping (placeholder stats OK)
- ❌ Question generation (seed data sufficient)
- ❌ Admin UI (not needed for beta)
- ❌ Advanced security (basic JWT OK)
- ❌ Monitoring/alerting dashboard

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| **Database connection issues** | Medium | Tobias tests early (Day 2) |
| **D&D integration delays** | Medium | Start early (Day 3), pair with Michi |
| **Kubernetes deployment fails** | Low | Test locally first, use documented manifests |
| **Team falls behind schedule** | Medium | Daily standup, drop nice-to-haves if needed |
| **Security vulnerabilities found** | Low | Use standard FastAPI patterns, no custom auth |

---

## Daily Standup Format

**Every morning (async, in Discord/Slack):**
- What did you finish yesterday?
- What are you working on today?
- Any blockers?

**If blocker:** Call quick sync (15 min) to unblock

---

## Post-Launch (Week 2+)

**After successful Day 14 launch:**
1. Gather feedback from beta users
2. Fix critical bugs
3. Plan Phase 2 (real LLM integration, monetization)
4. Start monitoring system health

---

## Key Team Contacts

| Role | Name | Hours | Focus |
|------|------|-------|-------|
| **Lead** | Tobias | 5h/week | Architecture, DevOps, backend |
| **Game Dev** | Michi | 15h/week | D&D integration, frontend |
| **Support** | Tim | 6h/week (Wed) | Testing, bug fixes, polish |

**Escalation:** Blockers → Tobias (architect)

---

## References & Quick Links

- `docs/ARCHITECTURE.md` - System design details
- `docs/BUSINESS_STRATEGY.md` - Why we're doing this
- `docs/archive/MIGRATION_NOTES.md` - Old documentation reference
- `CLAUDE.md` - Quick orientation

---

*Last updated: February 3, 2026*
*Next review: February 16, 2026 (launch day)*
