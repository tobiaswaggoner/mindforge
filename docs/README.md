# MindForge Documentation

## Quick Navigation

**New to the project?** Start here:
1. Read `CLAUDE.md` (quick orientation, 5 min)
2. Read `BUSINESS_STRATEGY.md` (vision & why, 15 min)
3. Skim `ARCHITECTURE.md` (how it works, 10 min)

**Building the next 14 days?**
→ Go straight to `SPRINT_14DAYS.md`

**Need specific technical info?**
→ See "Documentation Index" below

---

## Documentation Index

| Document | Purpose | Audience | Read Time |
|----------|---------|----------|-----------|
| **CLAUDE.md** | Quick orientation & links | Everyone | 5 min |
| **BUSINESS_STRATEGY.md** | Vision, GTM, team, monetization | Product, non-technical | 15 min |
| **ARCHITECTURE.md** | System design, infrastructure, database | Developers | 20 min |
| **SPRINT_14DAYS.md** | 14-day launch plan, daily tasks | Active developers | 15 min |
| **archive/MIGRATION_NOTES.md** | What changed in docs | Reference only | 5 min |

---

## Detailed Document Descriptions

### CLAUDE.md
Master index for the project. Quick facts:
- What is MindForge?
- Who's working on it?
- How do I find information?
- Key links to other docs

**Use when:** First time looking at the project, or need a quick reference

---

### BUSINESS_STRATEGY.md
The "why" and "what":
- Problem we're solving (Bloom's 2-Sigma)
- Vision (AI-driven adaptive learning)
- Target audience (students 14-19)
- Go-to-Market strategy (games as distribution)
- Ecosystem (MindForge + D&D + mindforge_work)
- Team & capacity (Tobias, Michi, Tim)
- Domains & infrastructure decisions
- Monetization model
- Success metrics

**Use when:** Understanding business context, pitch to investors, clarifying product direction

---

### ARCHITECTURE.md
The "how":
- System overview (diagram)
- Infrastructure (Hetzner, K3s, PostgreSQL)
- Backend API (FastAPI, endpoints)
- Database schema (overview + reference to detailed docs)
- Admin UI (Next.js, design system)
- Dungeons & Diplomas integration
- LLM integration architecture
- Event sourcing & logging
- Task management system
- Security & GDPR compliance
- CI/CD pipeline
- Technology stack

**Use when:** Building features, understanding system design, deployment questions

---

### SPRINT_14DAYS.md
The "what to do now":
- Day-by-day breakdown (Feb 3-16)
- Parallel workstreams (Tobias, Michi, Tim)
- Specific tasks for each day
- Success criteria
- Risk mitigation
- AI-assisted development strategy

**Use when:** During active development, daily standup, planning work

---

### archive/MIGRATION_NOTES.md
Reference documentation:
- What was archived and why
- How old docs map to new structure
- List of detailed reference docs (still useful, linked but not required reading)

**Use when:** Looking for historical context, understanding what changed

---

## Reference Documents (Detailed, Linked)

These are detailed technical specifications. Linked from main docs but not required for everyone:

- `architecture/database-schema.md` - Full database schema with migrations
- `architecture/admin-ui.md` - Complete UI specification & design system
- `architecture/task-management.md` - Task system implementation details
- `plan/2025-11-26-E02-ui-design.md` - Frontend implementation phases
- `plan/2025-11-26-E01-task-management.md` (archive/) - Backend implementation phases
- `sync/CROSS_PROJECT_HISTORY.md` - Dungeons & Diplomas context

---

## Common Questions

**Q: Where do I find the database schema?**
A: `docs/architecture/database-schema.md` (referenced in ARCHITECTURE.md)

**Q: What should I work on today?**
A: Check `SPRINT_14DAYS.md` for your role + the current date

**Q: Why Hetzner instead of AWS?**
A: See "Technical Approach to Data Privacy" in BUSINESS_STRATEGY.md

**Q: How does D&D connect to MindForge?**
A: See "Dungeons & Diplomas Integration" in ARCHITECTURE.md

**Q: What's the API contract for the game?**
A: See `architecture/admin-ui.md` section "API Endpoints for Game Integration"

**Q: How do I deploy changes?**
A: See "CI/CD Pipeline" in ARCHITECTURE.md and follow SPRINT_14DAYS.md

**Q: What's Event Sourcing?**
A: See "Event Sourcing & Logging" in ARCHITECTURE.md

**Q: How do we handle user data?**
A: See "Data Privacy & Security" in ARCHITECTURE.md

---

## Documentation Maintenance

**This documentation is kept current.** If something is out of date:
1. Check `archive/MIGRATION_NOTES.md` (was this recently changed?)
2. If still broken, update the document
3. Commit with `docs: update {topic}`

**Before adding documentation:**
- Does this info already exist elsewhere?
- Can I link to existing docs instead of duplicating?
- Can this be a paragraph instead of a full document?

---

## Team Capacity Impact

**25 hours/week team capacity** means documentation must be:
- ✅ Concise (no walls of text)
- ✅ Scannable (headers, tables, links)
- ✅ Single-source-of-truth (no duplication)
- ✅ Fast to update (simple structure)

If you find yourself spending hours reading docs, something's wrong. Tell Tobias.

---

*Last updated: February 3, 2026*
*Next docs review: After Day 14 (February 16, 2026)*
