# Documentation Migration - November 2025 → February 2026

## What Changed

This documentation was restructured to reduce cognitive load on a small team (25h/week capacity). The new structure has **4 core documents** instead of 15+, eliminating redundancy while preserving all critical information.

## What Was Archived

**Moved to `docs/archive/old/`:**
- `2025-09-09_*.md` (5 brainstorming files) - Historical context preserved, not actively needed
- `admin-ui-tmp.md` & `task-management-tmp.md` - Exact duplicates of current versions
- `StoryTemplate.md` - Unused template
- `README.md` (architecture/) - Only contained placeholder text

**Kept but referenced from new docs:**
- `2025-11-26_MindForge - AdminUI.md` - Design brief that fed E02 plan
- `2025-11-26-E01-task-management.md` - Implementation plan (in archive/)
- `CROSS_PROJECT_HISTORY.md` - Ecosystem context

## New Structure (February 2026)

```
mindforge/
├── CLAUDE.md                    # Master index & orientation
├── docs/
│   ├── README.md                # Quick navigation
│   ├── BUSINESS_STRATEGY.md     # Vision, GTM, Team, Domains, Monetization
│   ├── ARCHITECTURE.md          # System design, infrastructure, database, events
│   ├── SPRINT_14DAYS.md         # Beta launch plan (14 days)
│   │
│   └── archive/
│       ├── old/                 # Pre-Feb 2026 documentation
│       └── MIGRATION_NOTES.md   # This file
```

## Key Information Consolidated

| Topic | Old Location | New Location |
|-------|-------------|---|
| Vision & Problem Statement | brainstorming/ | BUSINESS_STRATEGY.md |
| Tech Stack Decisions | database-schema.md, admin-ui.md | ARCHITECTURE.md |
| Go-To-Market Strategy | mindforge_work/ | BUSINESS_STRATEGY.md |
| Team & Capacity | CLAUDE.md (scattered) | BUSINESS_STRATEGY.md (table) |
| Database Schema | database-schema.md | ARCHITECTURE.md (excerpt + link) |
| UI Design System | admin-ui.md | ARCHITECTURE.md (excerpt + link) |
| Task Architecture | task-management.md | ARCHITECTURE.md (excerpt + link) |
| Implementation Phases | plan/E01, E02 | SPRINT_14DAYS.md |
| Ecosystem Integration | CROSS_PROJECT_HISTORY.md | ARCHITECTURE.md + SPRINT_14DAYS.md |

## Critical Information Preserved

All critical technical information is preserved:
- ✅ Database indices and migration strategy
- ✅ UI design system (colors, fonts, spacing, breakpoints)
- ✅ Task system patterns (Circuit Breaker, handler registry)
- ✅ Event Sourcing rationale
- ✅ Component architecture
- ✅ Role-based access control specs
- ✅ Touch UI optimizations
- ✅ Pedagogical concepts (ELO, spaced repetition)
- ✅ Implementation phase details
- ✅ API endpoint specifications

## Files That Should Be Referenced

**For reference (don't need to read all, linked from main docs):**
- `docs/architecture/database-schema.md` - Data model authority
- `docs/architecture/admin-ui.md` - UI specs & design system
- `docs/architecture/task-management.md` - Task patterns
- `docs/plan/2025-11-26-E02-ui-design.md` - Frontend implementation plan
- `docs/plan/2025-11-26-E01-task-management.md` (archive/) - Backend implementation plan
- `docs/sync/CROSS_PROJECT_HISTORY.md` - D&D & mindforge_work context

## How to Use New Documentation

1. **First time?** Start with `CLAUDE.md` for orientation
2. **Understand the vision?** Read `BUSINESS_STRATEGY.md`
3. **Need technical details?** Read `ARCHITECTURE.md`
4. **Building next 14 days?** Follow `SPRINT_14DAYS.md`
5. **Need specific info?** Use CLAUDE.md links or search for keywords

## Breaking Changes

**None.** No information was lost, only consolidated and reorganized for better readability.

## Why This Matters for a Small Team

- **25 hours/week capacity** = documentation must not be a bottleneck
- **4 documents** vs 15+ = faster to navigate and maintain
- **Consolidated** = no duplication, single source of truth per topic
- **Cross-linked** = still access to detailed specs when needed

---

*Documentation restructured: February 3, 2026*
*Team capacity: 25h/week (Tobias 5h, Michi 15h, Tim 6h)*
*Next milestone: Beta launch in 14 days*
