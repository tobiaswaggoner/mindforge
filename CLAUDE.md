# CLAUDE.md - MindForge Project Guide

This file orients Claude Code (Claude.ai/claude-code) for working with this repository.

---

## 🎯 What is MindForge?

**MindForge** is an AI-driven learning ecosystem helping students (ages 14-19) acquire knowledge efficiently through adaptive personalization, gamification, and stealth assessment.

**The Problem:** Students struggle to learn at scale. Bloom's 2-Sigma Problem shows one-on-one tutoring produces 2σ better outcomes than classroom instruction.

**The Solution:** MindForge uses Knowledge Space Theory, adaptive difficulty, and AI tutoring to provide one-on-one-like learning at scale.

**The GTM:** We distribute via games. Dungeons & Diplomas is our first game—a free dungeon crawler where combat encounters are knowledge-based. Players who enjoy the game become MindForge users; we later promote paid products (like Klausurenretter exam prep).

---

## 📚 Documentation (Read in This Order)

### Quick (5-10 min)

1. **`docs/README.md`** - Documentation index & quick answers
2. **This file** - You're reading it

### Essential (30 min)

3. **`docs/BUSINESS_STRATEGY.md`** - Why we exist, who we serve, how we make money, team structure
4. **`docs/ARCHITECTURE.md`** - System design, infrastructure, database, API structure
5. **`docs/SPRINT_14DAYS.md`** - Current 14-day launch plan (Feb 3-16, 2026)

### Reference (As Needed)

- `docs/architecture/database-schema.md` - Full database schema
- `docs/architecture/admin-ui.md` - UI design system & specifications
- `docs/architecture/task-management.md` - Backend task system
- `docs/sync/CROSS_PROJECT_HISTORY.md` - Dungeons & Diplomas context
- `docs/archive/MIGRATION_NOTES.md` - What changed in documentation

---

## 🚀 Current Status

**Timeline:** 14-day beta launch (Feb 3-16, 2026)

**Deliverables:**
- ✅ MindForge backend (FastAPI) with authentication
- ✅ Dungeons & Diplomas integrated with MindForge auth
- ✅ Event logging (stealth assessment)
- ✅ Deployed on Hetzner K3s cluster
- ✅ HTTPS via Let's Encrypt

**Not included in beta:**
- ❌ Advanced KST mapping (placeholder stats OK)
- ❌ Question generation via LLM (seed data only)
- ❌ Admin UI (backend API only)
- ❌ Monetization features (foundation only)

---

## 👥 Team & Capacity

| Person | Hours/Week | Role | Focus |
|--------|-----------|------|-------|
| **Tobias** | 5h | Lead, DevOps | Backend, infrastructure, decisions |
| **Michi** | 15h | Developer (apprentice) | D&D game integration, frontend |
| **Tim** | 6h (Wed only) | Developer (intern) | Testing, bug fixes, support |

**Total: 26 hours/week** → **AI-assisted coding is critical** for speed

---

## 🏗️ Architecture at a Glance

```
Games (Dungeons & Diplomas, future games)
         ↓ HTTPS
MindForge Backend (Python FastAPI, Hetzner K3s)
  • Authentication (register, login, JWT)
  • Questions API (load questions for games)
  • Events API (stealth assessment logging)
  • Learner profiles (KST progress tracking)
  • Task queue (background jobs)
         ↓
PostgreSQL Database (Hetzner, non-HA for beta)
  • Users, Questions, Variants, Answers
  • Events (immutable log of all learning activity)
  • Learner profiles
```

**Infrastructure:** Hetzner (German hosting, no U.S. jurisdiction), K3s (Kubernetes), Let's Encrypt (SSL)

**Why Hetzner & EU-only?** Dealing with minors' learning data requires protection from Cloud Act, foreign intelligence, etc. Our approach: self-hosted in EU, open-source stack, no AWS/Google/Azure/Vercel.

---

## 📋 What Should I Do?

### First Time Here?

1. Read `docs/README.md` (navigation guide)
2. Read `docs/BUSINESS_STRATEGY.md` (context)
3. Skim `docs/ARCHITECTURE.md` (technical overview)
4. Check `docs/SPRINT_14DAYS.md` (what's being built now)

### Active Developer?

1. Check current date against `docs/SPRINT_14DAYS.md`
2. Find your workstream (Tobias/Michi/Tim)
3. Read the tasks for today
4. Ask Tobias if anything is unclear

### Need to Fix a Bug?

1. Check `docs/ARCHITECTURE.md` for system overview
2. Check `docs/architecture/*.md` for specific component details
3. Write fix, test locally with `docker-compose` or K3s
4. Push to GitHub → CI/CD tests → deploys to K3s

### Need to Add a Feature?

1. Clarify: Is this part of the 14-day sprint? (Check `SPRINT_14DAYS.md`)
2. If yes: Follow the sprint plan for that feature
3. If no: Ask Tobias (might need to defer until after beta)

---

## 🔗 Quick Links

| Need | Resource |
|------|----------|
| **Business context** | `docs/BUSINESS_STRATEGY.md` |
| **Technical architecture** | `docs/ARCHITECTURE.md` |
| **What to build (14 days)** | `docs/SPRINT_14DAYS.md` |
| **Database schema** | `docs/architecture/database-schema.md` |
| **UI design system** | `docs/architecture/admin-ui.md` |
| **API documentation** | `docs/architecture/admin-ui.md` (section: API endpoints) |
| **Task system** | `docs/architecture/task-management.md` |
| **D&D integration** | `docs/architecture/admin-ui.md` + `docs/SPRINT_14DAYS.md` |
| **Documentation index** | `docs/README.md` |
| **What changed in docs?** | `docs/archive/MIGRATION_NOTES.md` |

---

## 🛠️ Development Workflow

### Local Development

**Backend (Python FastAPI):**
```bash
cd apps/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn src.main:app --reload
# Server at http://localhost:8000
```

**Frontend (Next.js Admin UI):**
```bash
cd apps/admin
npm install
npm run dev
# App at http://localhost:3000
```

**Game (Dungeons & Diplomas):**
```bash
cd ../dungeons-and-diplomas
npm install
npm run dev
# Game at http://localhost:3000 (or check D&D repo for port)
```

### Testing & Deployment

**Local testing:**
```bash
# Test backend endpoint
curl http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"..."}'
```

**Deployment:**
```bash
# GitHub Actions handles this automatically
# 1. Push to main
# 2. CI builds Docker image
# 3. CI pushes to K3s registry
# 4. K3s deploys new version
# Check: kubectl logs deployment/mindforge -n mindforge-prod
```

---

## 💾 Databases

### Development (SQLite)
```bash
# Located at: apps/backend/mindforge.db
# Initialize: python -m packages.db.init
```

### Production (PostgreSQL on Hetzner)
```bash
# Via Kubernetes secret:
# kubectl get secret mindforge-db -n mindforge-prod
# Connection string in environment variable: DATABASE_URL
```

### Migrations
```bash
# Create migration:
# python -m packages.db.create_migration "migration_name"

# Run migrations:
# python -m packages.db.migrate --env=production
```

---

## 🔐 Security & Privacy

**Data Privacy:**
- EU GDPR compliant
- No U.S. jurisdiction (Hetzner only)
- Event Sourcing (immutable logs for audit)
- Soft deletes (preserve history for GDPR requests)
- Hashed passwords (bcrypt)
- JWT tokens (stateless auth)

**Do NOT:**
- Store plaintext passwords
- Put secrets in code (use environment variables)
- Log sensitive data (emails, passwords, tokens)
- Use U.S.-based services for student data

**If you find a security issue:**
→ Tell Tobias immediately (don't commit publicly)

---

## 📊 Code Style & Conventions

### Language
- **Code & Comments:** English
- **UI Text:** German (for German students)
- **Documentation:** German (internal), English (code docs)

### Code Standards

**Python (Backend):**
- PEP 8 style
- Type hints everywhere (`def func(x: int) -> str:`)
- Docstrings for functions
- Use FastAPI decorators correctly

**TypeScript (Frontend):**
- Strict mode enabled
- ESLint + Prettier (auto-format)
- React functional components
- Custom hooks for logic (no class components)

**Git Commits:**
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Example: `feat: add user registration endpoint`
- Example: `fix: JWT token validation bug`

---

## 🎯 Sprint Goals & Milestones

**Sprint: Feb 3-16, 2026 (14 days)**

**Day 1-3:** Infrastructure setup + auth backend skeleton
**Day 4-7:** Auth endpoints + D&D integration
**Day 8-10:** Event logging + stealth assessment
**Day 11-13:** Deployment + production fixes
**Day 14:** Beta launch + validation

→ **Full details:** `docs/SPRINT_14DAYS.md`

---

## ❓ FAQ

**Q: How do games connect to MindForge?**
A: Games register/login users via MindForge backend. When players answer questions, the game logs events. MindForge builds learner profiles from events.

**Q: When does LLM question generation happen?**
A: After beta launch. For now, we use seed data (100+ manually-curated questions).

**Q: Why PostgreSQL instead of SQLite for production?**
A: SQLite doesn't work on Vercel. PostgreSQL is robust for production. We host on Hetzner K3s, so PostgreSQL is natural choice.

**Q: Can I add new features during the sprint?**
A: No. All features for the sprint are pre-committed. New features start after Day 14.

**Q: What if I find a bug?**
A: Fix it! Bugs discovered during sprint are fair game. Tell Tobias if it affects sprint timeline.

**Q: How do I know if the API is working?**
A: Check server logs: `kubectl logs deployment/mindforge -n mindforge-prod`

**Q: What's the test user account?**
A: Will be documented on Day 3. For now, create your own via registration.

---

## 📞 Escalation & Help

**If stuck:**
1. Check `docs/ARCHITECTURE.md` (system overview)
2. Check relevant reference doc (database-schema, admin-ui, etc.)
3. Check GitHub issues
4. Ask in standup
5. Ping Tobias directly for blocker issues

**Tobias is the architect** → If you're unsure about approach, ask him

---

## 🗂️ Repository Structure

```
mindforge/
├── CLAUDE.md                         ← You are here
├── dev.sh                            # Development startup script
├── docker-compose.yml                # Local dev Docker setup
│
├── apps/
│   ├── backend/                      # Python FastAPI backend
│   │   ├── src/
│   │   │   ├── api/routes/           # API endpoints
│   │   │   ├── models/               # Pydantic models
│   │   │   ├── db/                   # Database layer
│   │   │   └── main.py               # FastAPI app
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── admin/                        # Next.js admin UI (future)
│       ├── src/
│       │   ├── app/                  # Next.js pages
│       │   ├── components/           # React components
│       │   └── lib/                  # Utilities
│       ├── package.json
│       └── Dockerfile
│
├── packages/
│   ├── db/                           # Shared database abstraction
│   │   └── migrations/               # Database migrations
│   └── types/                        # Shared TypeScript types
│
├── docs/
│   ├── README.md                     # Documentation index
│   ├── BUSINESS_STRATEGY.md          # Vision & GTM
│   ├── ARCHITECTURE.md               # System design
│   ├── SPRINT_14DAYS.md              # Current sprint plan
│   │
│   ├── architecture/
│   │   ├── database-schema.md        # Detailed DB schema
│   │   ├── admin-ui.md               # UI specifications
│   │   └── task-management.md        # Task system
│   │
│   └── archive/
│       ├── MIGRATION_NOTES.md        # What changed
│       └── old/                      # Pre-Feb 2026 docs
│
└── ai/
    └── instructions/                 # LLM prompts & configs
```

---

## 🚀 Key Decisions (Why We Chose This)

| Decision | Why |
|----------|-----|
| **Hetzner + K3s** | EU-only, no U.S. jurisdiction, affordable, DevOps-friendly |
| **PostgreSQL** | Production-grade, supports complex queries, can scale |
| **FastAPI** | Modern Python, async-native, great for real-time tasks |
| **Next.js** | React ecosystem, full-stack, great for admin panels |
| **Event Sourcing** | Immutable audit trail, enables AI analysis, GDPR-friendly |
| **Games as distribution** | Learning apps aren't viral; games are. Use games to acquire users. |

---

## 📅 Timeline & Context

**Project start:** ~Nov 2025 (admin UI + backend foundation)
**Current date:** Feb 3, 2026
**Beta launch target:** Feb 16, 2026 (14 days)
**Next major milestone:** March 2026 (real LLM integration)

**Long-term vision (2 years):**
- 100,000+ users across games
- Multiple games (D&D is first)
- Full KST mapping per learner
- €10k-50k MRR from paid products

---

## 🎓 Learning Resources

Not required reading, but helpful background:

- **Bloom's 2-Sigma Problem** (Bloom, 1984) - Why one-on-one tutoring works
- **Knowledge Space Theory** (Doignon & Falmagne, 1999) - Mathematical foundation for adaptive learning
- **Spaced Repetition** (Ebbinghaus, Wozniak) - Why spacing helps memory
- **FastAPI** docs (https://fastapi.tiangolo.com/) - Backend framework
- **Next.js** docs (https://nextjs.org/) - Frontend framework
- **Kubernetes** basics - Container orchestration

---

## ✍️ Last Updated

**February 3, 2026** - Documentation restructure, prep for 14-day sprint

**Next review:** February 16, 2026 (after beta launch)

---

*For questions or clarifications, check `docs/README.md` or ask Tobias.*
