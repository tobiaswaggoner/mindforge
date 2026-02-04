# MindForge Business Strategy & Vision

## The Problem We're Solving

Students struggle with knowledge acquisition at scale. Bloom's 2-Sigma Problem states that with one-on-one tutoring, students perform 2 standard deviations better than traditional classroom instruction. MindForge solves this through **AI-driven adaptive personalization** at scale.

### Why Now?

- **AI-enhanced coding** makes development of sophisticated systems feasible with small teams
- **Knowledge Space Theory** provides mathematical foundation for intelligent assessment
- **Event Sourcing** enables full learning history for AI analysis
- **Open-source game engines** make gamified learning affordable

---

## Vision: The Platform

**MindForge** is an AI-native learning ecosystem that enables students (and later, other learners) to acquire knowledge with unprecedented efficiency through:

- **Adaptive personalization** based on Knowledge Space Theory (KST)
- **Socratic prompting** via AI tutors for guided discovery
- **Mastery-based progression** with intelligent spaced repetition
- **Real-time difficulty adaptation** calibrated to individual learners
- **Stealth assessment** gathering learning data while students engage with games

### Core Features

1. **Intelligent Content Generation** - AI creates questions, variants, and learning paths
2. **Adaptive Difficulty** - Questions scale to learner's current knowledge state
3. **Progress Tracking** - Comprehensive learner profiles with KST mapping
4. **Gamified Assessment** - Learning happens through engaging games
5. **Ecosystem Integration** - Multiple games feed the same central learning engine

---

## Target Audience

**Primary (Phase 1):** Students ages 14-19 (Grades 9-13, German Gymnasium)
- High school mathematics, chemistry, physics, languages
- Self-directed learners who want to prepare for exams
- Students seeking supplement to classroom instruction

**Secondary (Phase 2+):** Professional continuing education, university prep, polyglots
- Anyone needing efficient skill acquisition

---

## The GTM Strategy: Games as Lead Generation

### The Problem with Education Tech

Traditional learning platforms aren't intrinsically engaging. Students need extrinsic motivation to use them. Even with perfect pedagogy, they won't use a "boring learning app."

### The Solution: Gamification is the Distribution Channel

**Dungeons & Diplomas** is our first game - a procedurally-generated dungeon crawler where combat encounters require answering questions correctly to defeat enemies.

```
Player installs D&D → Creates account → That's a MindForge account
         ↓
   Plays free D&D game
         ↓
   Answers questions (stealth assessment data)
         ↓
   MindForge builds learner profile
         ↓
   When next product launches (e.g., Klausurenretter),
   we promote it to registered players with target messaging
```

### Why This Works

1. **Viral potential** - Games can go viral; learning platforms rarely do
2. **Right audience** - Players of dungeon crawlers match our target demographic (14-25)
3. **Network effects** - More players = more learning data = better personalization for all
4. **Low CAC** - Game development is now affordable with AI-assisted coding
5. **Scalable** - Plan to build many games; each feeds central data lake

### Economic Model

| Product | Price | Purpose |
|---------|-------|---------|
| **Dungeons & Diplomas** | Free (+ cosmetic items) | Lead generation, data gathering |
| **Klausurenretter** | €4.99-9.99/month (or one-time) | Revenue generation, exam prep |
| **Future games/products** | Mixed (free + paid versions) | Continued distribution |

---

## Ecosystem Overview

### The Three Projects

| Project | Purpose | Status | Owner |
|---------|---------|--------|-------|
| **MindForge** (this repo) | Content engine, user profiles, central backend | Beta (14 days) | Tobias |
| **Dungeons & Diplomas** | Game-based assessment, lead generation | Feature-complete, integrating | Michi |
| **mindforge_work** | Strategic planning, concept validation, research | Active reference | Tobias |

### How They Connect

```
Dungeons & Diplomas (Game)
    ↓ (stealth assessment)
    ├─ Logs: questions asked, answers given, times, correctness
    ↓
MindForge Backend
    ├─ Stores raw events
    ├─ Aggregates to learner profiles (KST mapping)
    ├─ Generates adaptive questions
    ├─ Tracks learning progression
    ↓
Next Product (Klausurenretter, etc.)
    └─ Uses learner profiles for personalized exam prep
```

---

## Team & Capacity

### Current Team

| Name | Role | Hours/Week | Focus |
|------|------|-----------|-------|
| **Tobias** | Lead, DevOps, Architecture | 5 hours | Backend infrastructure, system design, deployment |
| **Michi** | Developer (in Ausbildung) | 15 hours | D&D game development, frontend features |
| **Tim** | Developer (Praktikum) | 6 hours (Wed only) | D&D game features, testing |

**Total: 26 hours/week human capacity**

### AI Augmentation Strategy

- **GitHub Copilot** for code generation & completion
- **Claude AI** for architectural decisions, documentation, complex refactoring
- **AI-assisted coding** reduces time 3-5x vs traditional development
- **Massive parallelization** - multiple AI tasks running simultaneously

---

## Domains & URLs

| Product | Domain | Status |
|---------|--------|--------|
| **MindForge** | `mindforge.de` | Planned (to reserve) |
| **Dungeons & Diplomas** | `dungeons-diplomas.de` | Planned (to reserve) |
| **Branding note** | Games are "standalone" to feel independent | Design decision |

**DNS Provider:** Dogado (ehemals Kontent.de)

---

## Technical Approach to Data Privacy

### Why Infrastructure Matters

Dealing with minors' learning data requires extreme care. EU GDPR is table stakes, but we go further:

- **Cloud Act risk** - U.S. government can demand data from U.S. cloud providers
- **Foreign intelligence** - Other governments' signals intelligence capabilities
- **Mitigation** - Host everything in EU (Hetzner), use only open-source infrastructure

### Our Infrastructure Choice

- **Hetzner** (German hosting, no U.S. exposure)
- **PostgreSQL** (not proprietary cloud databases)
- **Kubernetes** (container orchestration, portable)
- **Let's Encrypt** (free, standards-based SSL)
- **No AWS, Azure, Google Cloud, Vercel** (U.S. jurisdiction)

### Data Security Principle

We want to ensure that even with a secret government court order, it would be technically difficult for any foreign power to access our learners' data.

---

## Monetization Strategy

### Phase 1 (Now): Data & Distribution

- **Dungeons & Diplomas** = free (maybe cosmetic items later)
- **Goal:** 10,000+ registered players by autumn 2026
- **Metric:** Active monthly users (target: 5,000+ regular players)

### Phase 2 (Months 3-6): Paid Products

- **Klausurenretter** (exam prep tool) = €4.99-9.99/month or €29.99 one-time
- **In-game cosmetic purchases** = revenue test
- **Promoted to high-value players** (those with strong engagement)

### Phase 3 (Month 6+): Expansion

- More games (multiple products = multiple distribution channels)
- Subscription tiers
- Institutional licensing (schools, tutoring companies)
- Corporate training

### Unit Economics (Target)

- **Customer Acquisition Cost (CAC):** Near zero (organic from games)
- **Lifetime Value (LTV):** €50-150 (based on exam relevance, recurring use)
- **LTV:CAC ratio:** 50:1+ (healthy SaaS model)

---

## Success Metrics for Beta Launch (14 Days)

### Hard Requirements

- ✅ MindForge account system operational
- ✅ D&D integrated with MindForge auth
- ✅ All planned D&D features finalized
- ✅ Stealth assessment data logging working
- ✅ Deployment to Hetzner/K3s successful
- ✅ Let's Encrypt SSL active

### Success Indicators

- 100+ test users can register via D&D
- Questions are logged with full metadata
- User profiles start accumulating data
- No critical bugs in deployment

---

## Long-Term Vision (2 Years)

1. **Community** - 100,000+ registered users across games
2. **Content** - 1,000+ questions per subject with variants
3. **Pedagogy** - Full KST mapping per learner
4. **Revenue** - €10k-50k MRR from paid products
5. **Team** - 3-5 full-time developers
6. **Games** - 3-5 different game-based assessment tools
7. **Institutions** - Partnerships with schools using MindForge

---

## Risk & Mitigation

### Key Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **D&D doesn't gain traction** | No lead funnel | Build multiple games, each can go viral |
| **Users churn to competitors** | Low lifetime value | Superior personalization through KST |
| **Infrastructure costs explode** | Unit economics fail | Self-hosted on Hetzner, not AWS |
| **Regulatory changes** | Data deletion orders | Minimal data, open-source approach |
| **Team burnout** | Project stalls | 25h/week is sustainable, async-friendly |

---

## Key Decisions & Rationale

### Why Kubernetes + Hetzner, Not Vercel/Supabase?

- ✅ **Control** - Self-hosted means no dependency on U.S. platforms
- ✅ **Cost** - €50-100/month on Hetzner vs €500+/month on AWS
- ✅ **Privacy** - German data protection laws, single jurisdiction
- ❌ **Ops overhead** - Tobias is DevOps engineer, team has capacity
- ❌ **Scalability** - K3s is sufficient for early growth

### Why Event Sourcing for Learning Data?

- ✅ **Immutable history** - Never lose a student answer (audit trail)
- ✅ **AI analysis** - Full context for learning patterns
- ✅ **Debugging** - Replay events to understand user journey
- ✅ **Privacy by design** - Minimal PII, events-based
- ❌ **Storage** - Large log tables (acceptable for Beta)

### Why Games First, Not Direct Learning Platforms?

- ✅ **Distribution** - Games can be viral; learning apps aren't
- ✅ **Engagement** - Students use games willingly
- ✅ **Data quality** - Real behavior, not forced participation
- ❌ **Scope creep** - Game dev is separate from learning engine
- ❌ **Timeline** - Longer to first user engagement

---

## References & Further Reading

- `docs/ARCHITECTURE.md` - Technical system design
- `docs/SPRINT_14DAYS.md` - Detailed 14-day launch plan
- `docs/sync/CROSS_PROJECT_HISTORY.md` - D&D & mindforge_work context
- `CLAUDE.md` - Quick orientation
- Parent concept: Knowledge Space Theory (Doignon & Falmagne, 1999)
- Related work: Bloom's 2-Sigma Problem, Mastery Learning

---

*Last updated: February 3, 2026*
*Next review: After 14-day beta launch*
