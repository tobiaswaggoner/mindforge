# Admin UI - Architektur & Design

## Übersicht

Das MindForge Admin UI ist die zentrale Verwaltungsoberfläche für die AI-gestützte Content-Pipeline. Primärer Fokus ist die Steuerung der automatisierten Generierung von Lerninhalten sowie deren manuelle Moderation.

### Kernfunktionen

| Funktion | Beschreibung |
|----------|--------------|
| **Task Management** | Starten, Überwachen und Verwalten von AI-Generierungs-Jobs |
| **Content Editor** | CRUD-Operationen für Subjects, Clusters, Variants, Answers |
| **User Management** | Authentifizierung und Benutzerverwaltung |

### Prioritäten

1. **Primär**: AI-gestützte Content-Generierung steuern
2. **Sekundär**: Manuelles Moderieren und Editieren
3. **Tertiär**: Reporting und Statistiken

---

## Tech Stack

| Komponente | Technologie | Anmerkungen |
|------------|-------------|-------------|
| **Framework** | Next.js 14+ (App Router) | React Server Components |
| **Styling** | Tailwind CSS | Utility-first |
| **Components** | shadcn/ui | Radix-basiert, customizable |
| **Auth** | NextAuth.js | Credentials-Provider (MVP), OAuth später |
| **State** | React Context / Zustand | Für Client-State |
| **Forms** | React Hook Form + Zod | Validation |

---

## Design System

### Farbpalette

Basierend auf dem MindForge Brand (Orange/Anthrazit):

```css
:root {
  /* Primary - Deep Orange */
  --primary: #ff6d00;
  --primary-hover: #ff8f00;
  --primary-muted: #ff6d0020;

  /* Neutral - Anthrazit */
  --background-dark: #1a1a1a;
  --surface-dark: #242424;
  --surface-elevated-dark: #2d2d2d;
  --border-dark: #3d3d3d;

  --background-light: #fafafa;
  --surface-light: #ffffff;
  --surface-elevated-light: #f5f5f5;
  --border-light: #e5e5e5;

  /* Text */
  --text-primary-dark: #ffffff;
  --text-secondary-dark: #a3a3a3;
  --text-primary-light: #171717;
  --text-secondary-light: #737373;

  /* Status Colors */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Typography

- **Font**: Inter (UI), JetBrains Mono (Code)
- **Scale**: 12px / 14px / 16px / 18px / 24px / 32px

### Design-Prinzipien

1. **Dark Mode Default** - Admins arbeiten oft lange, Light Mode als Option
2. **Kompakte Darstellung** - Viel Information, wenig Whitespace, aber atmend
3. **Subtle Depth** - Sanfte Shadows statt hartem Kontrast
4. **Responsive First** - Mobile-tauglich für Task Management unterwegs

---

## Seitenstruktur

### Navigation

**Top-Navigation** (Hauptebene):
```
┌─────────────────────────────────────────────────────────────────┐
│  🔶 MindForge  │  Dashboard  Content  Tasks  │  🌙  👤  Logout  │
└─────────────────────────────────────────────────────────────────┘
```

**Sidebar** (Kontextuelle Unternavigation, je nach Bereich)

### Seitenhierarchie

```
/
├── /login                 # Login Page
├── /register              # Registrierung
├── /forgot-password       # Passwort vergessen
├── /reset-password        # Passwort zurücksetzen
│
├── /dashboard             # Übersicht (nach Login)
│
├── /content               # Content Management
│   ├── /content           # Übersicht aller Subjects
│   └── /content/[id]      # Detail-Ansicht (dynamisch)
│
├── /tasks                 # Task Management
│   ├── /tasks             # Task-Liste
│   └── /tasks/[id]        # Task-Detail
│
└── /settings              # Einstellungen
    ├── /settings/profile  # User Profile
    └── /settings/system   # System Config (später)
```

---

## Hauptbereiche

### 1. Dashboard

Zentrale Übersicht nach Login.

**Layout (Desktop)**:
```
┌────────────────────────────────────┬────────────────────────────┐
│                                    │                            │
│  Active Tasks (Live)               │  Quick Stats               │
│  ┌────────────────────────────┐    │  ┌──────┐ ┌──────┐        │
│  │ ████████░░░░ 67% Mathe...  │    │  │  12  │ │ 847  │        │
│  └────────────────────────────┘    │  │Subj. │ │Clust.│        │
│                                    │  └──────┘ └──────┘        │
│  Recent Changes                    │  ┌──────┐ ┌──────┐        │
│  • 14:32 - 45 variants created     │  │ 3.2k │ │ 12k  │        │
│  • 14:28 - Task completed          │  │ Var. │ │ Ans. │        │
│  • 14:15 - Manual edit: Cluster 7  │  └──────┘ └──────┘        │
│                                    │                            │
│                                    │  Quick Actions             │
│                                    │  [+ New Subject]           │
│                                    │  [⚡ Generate Questions]   │
└────────────────────────────────────┴────────────────────────────┘
```

**Layout (Mobile)**: Vertikales Stack, Stats als horizontale Scroll-Cards.

---

### 2. Content Editor

Herzstück der Anwendung. Master-Detail-Layout mit Breadcrumb-Navigation.

**Konzept**: Keine verschachtelte Baumansicht, sondern kontextuelle Navigation:
- Subject → zeigt Cluster-Liste
- Cluster → zeigt Variants-Liste
- Variant → zeigt Answers

**Desktop Layout**:
```
┌──────────────────────────────────────────────────────────────────┐
│ 🔍 Suche...  │ Filter: [Subject ▾] [Task ▾] [Status ▾]  │ + Neu │
├──────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Subjects > Mathe 9 > Algebra > Cluster "Lineare Gl."│
├───────────────────────┬──────────────────────────────────────────┤
│                       │                                          │
│  📚 Mathe 9           │  Cluster: Lineare Gleichungen            │
│    ├─ Algebra ←       │  ──────────────────────────────          │
│    │   ├─ Lin. Gl.    │  Topic: Lösen einfacher linearer Gl.    │
│    │   ├─ Quad. Gl.   │  Difficulty: ████░░░░░░ 4/10            │
│    │   └─ Ungl.       │  Variants: 12                            │
│    └─ Geometrie       │                                          │
│                       │  [✏️ Edit] [🔄 Generate Variants] [🗑️]   │
│  📚 Deutsch 9         │  ────────────────────────────────────    │
│  📚 Englisch 9        │                                          │
│                       │  Variants                                │
│                       │  ┌────────────────────────────────────┐  │
│                       │  │ "Löse: 2x + 3 = 7"          [Edit] │  │
│                       │  │ Answers: 4 • Correct: x = 2        │  │
│                       │  └────────────────────────────────────┘  │
│                       │  ┌────────────────────────────────────┐  │
│                       │  │ "Löse: 4x - 1 = 11"         [Edit] │  │
│                       │  │ Answers: 4 • Correct: x = 3        │  │
│                       │  └────────────────────────────────────┘  │
│                       │                                          │
└───────────────────────┴──────────────────────────────────────────┘
```

**Mobile Layout**:
- Sidebar wird zum Hamburger-Menü / Bottom Sheet
- Full-Screen Detail-Ansicht mit Back-Button
- Swipe-Gesten für Navigation

**Hierarchie-Modell**:
```
Subject (Fach)
  └── QuestionCluster (kanonische Frage, OHNE Fragetext)
        └── QuestionVariant (mit Fragetext)
              └── Answer[] (exakt 4 Antworten)
```

> **Hinweis**: Die Ebene oberhalb von Subject (Themes, Topics gemäß KST) wird später als separater Editor implementiert. Das aktuelle UI fokussiert auf Assessment-Content.

---

### 3. Task Management

Steuerung und Monitoring der AI-Generierungs-Jobs.

**Task-Liste**:
```
┌─────────────────────────────────────────────────────────────────────┐
│ ● In Progress (2)  ○ Pending (1)  ✓ Completed (24)  ✗ Failed (0)   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 🔄 Generate Questions                              IN_PROGRESS  ││
│ │    Subject: Mathe 9 - Algebra                                   ││
│ │    ████████████░░░░░░░░ 65%  •  23/35 items  •  2:34           ││
│ │    "Generating cluster 4 of 10..."                              ││
│ │    [View Results] [Cancel]                                      ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ ✓ Generate Variants                                  COMPLETED  ││
│ │    Cluster: Quadratische Gleichungen                            ││
│ │    45 variants created  •  Completed 5 min ago                  ││
│ │    [View Results] [✓ Accept] [↩️ Revert All]                    ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ ✗ Generate Questions                                    FAILED  ││
│ │    Subject: Deutsch 9                                           ││
│ │    Error: LLM service unavailable  •  Retry 2/3                 ││
│ │    Scheduled retry in 40s                                       ││
│ │    [View Details] [🔄 Retry Now] [Cancel]                       ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Task-Status** (synchronisiert mit Backend):

| Status | UI-Label | Beschreibung |
|--------|----------|--------------|
| `pending` | Pending | Task wartet auf Ausführung |
| `in_progress` | In Progress | Task wird gerade ausgeführt |
| `completed` | Completed | Task erfolgreich abgeschlossen |
| `failed` | Failed | Task fehlgeschlagen (nach max_retries) |
| `cancelled` | Cancelled | Task vom User abgebrochen |

**Task-Typen** (API-Values → UI-Labels):

| API-Value | UI-Label | Scope | Output |
|-----------|----------|-------|--------|
| `generate_clusters` | "Generate Questions" | Subject | Neue QuestionClusters + Variants + Answers |
| `generate_variants` | "Generate Variants" | QuestionCluster | Neue QuestionVariants + Answers |
| `regenerate_answers` | "Regenerate Answers" | QuestionVariant | Neue Answers (ersetzt bestehende) |

**Task-Actions**:
- **View Results**: Springt zum Content Editor mit Task-Filter
- **Accept**: Markiert Task als akzeptiert (`accepted_at` wird gesetzt)
- **Revert All**: Macht alle Änderungen des Tasks rückgängig (`reverted_at` wird gesetzt)
- **Retry Now**: Startet fehlgeschlagenen Task sofort neu
- **Cancel**: Bricht laufenden/wartenden Task ab

**Task-Card Felder** (aus Backend-Schema):

| Feld | Anzeige | Beispiel |
|------|---------|----------|
| `progress_current` / `progress_total` | Fortschrittsbalken + Text | "23/35 items" |
| `progress_message` | Live-Status unterhalb Progress | "Generating cluster 4 of 10..." |
| `error_message` | Bei `failed` Tasks | "Error: LLM service unavailable" |
| `retry_count` / `max_retries` | Bei Retries | "Retry 2/3" |
| `delayed_until` | Bei scheduled Retries | "Scheduled retry in 40s" |
| `created_at` / `completed_at` | Zeitangaben | "Completed 5 min ago" |

---

### 4. Generate Modal

Einheitlicher Dialog für alle Generierungs-Tasks.

```
┌─────────────────────────────────────────────────────────────┐
│ Generate New Content                               [×]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Context                                                     │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📚 Mathe 9 → Algebra                                    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Task Type                                                   │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐      │
│ │ ● Questions   │ │ ○ Variants    │ │ ○ Answers     │      │
│ │ (Clusters)    │ │               │ │               │      │
│ └───────────────┘ └───────────────┘ └───────────────┘      │
│                                                             │
│ Parameters                                                  │
│ Clusters:  [10]      Variants per cluster: [5]             │
│ Answers per variant: [4]                                   │
│                                                             │
│ Additional Instructions (user_context)                      │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Fokus auf lineare Gleichungen mit Brüchen.              ││
│ │ Schwierigkeitsgrad zwischen 3 und 6.                    ││
│ │ Anwendungsaufgaben aus dem Alltag bevorzugen.           ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│                              [Cancel]  [▶ Start Generation]│
└─────────────────────────────────────────────────────────────┘
```

**Mapping UI → API:**

| UI-Auswahl | API `task_type` | Payload |
|------------|-----------------|---------|
| "Questions" | `generate_clusters` | `{ subject_id, count, variants_per_cluster, answers_per_variant }` |
| "Variants" | `generate_variants` | `{ cluster_id, count, answers_per_variant }` |
| "Answers" | `regenerate_answers` | `{ variant_id, count }` |

---

## Authentication

### Technische Umsetzung

**NextAuth.js** mit Credentials-Provider:
- MVP: Username/Password gegen eigene Datenbank
- Später: OAuth-Provider (Google, GitHub, etc.) hinzufügbar

**Mock-Modus für Entwicklung**:
```typescript
// Umgebungsvariable: NEXT_PUBLIC_AUTH_MOCK=true
// Bypassed Authentication, automatischer Login als Test-User
```

### Auth Pages

| Seite | Route | Felder |
|-------|-------|--------|
| **Login** | `/login` | Email, Password, "Remember me" |
| **Register** | `/register` | Name, Email, Password, Confirm |
| **Forgot Password** | `/forgot-password` | Email |
| **Reset Password** | `/reset-password` | New Password, Confirm |

### User Schema (Erweiterung)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'editor',       -- 'admin', 'editor', 'viewer'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP
);
```

---

## Task Schema (Synchronisiert mit Backend)

> **Hinweis**: Dieses Schema ist abgestimmt mit `docs/architecture/task-management-tmp.md`.

```sql
CREATE TABLE generation_tasks (
    -- Identifikation
    id TEXT PRIMARY KEY,                    -- UUID
    task_type TEXT NOT NULL,                -- 'generate_clusters', 'generate_variants', 'regenerate_answers'

    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'cancelled'

    -- Payload (flexibel, task-type-spezifisch)
    payload TEXT NOT NULL,                  -- JSON: { subject_id, cluster_id, count, variants_per_cluster, ... }
    user_context TEXT,                      -- Freitext für LLM-Prompt (Additional Instructions)

    -- Scheduling
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delayed_until TIMESTAMP,                -- NULL = sofort ausführbar, sonst: scheduled retry
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Progress & Health Monitoring
    progress_current INTEGER DEFAULT 0,
    progress_total INTEGER DEFAULT 0,
    progress_message TEXT,                  -- Aktueller Schritt als Text, z.B. "Generating cluster 4 of 10..."
    heartbeat_at TIMESTAMP,                 -- Worker setzt alle 30 Sekunden (Backend-intern)

    -- Error Handling & Retry
    error_message TEXT,                     -- Fehlermeldung bei failed Tasks
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Accept/Revert Workflow (Frontend-gesteuert)
    accepted_at TIMESTAMP,                  -- Wann wurde der Task akzeptiert?
    reverted_at TIMESTAMP                   -- Wann wurden die Änderungen rückgängig gemacht?
);

-- Artefakte-Verknüpfungstabelle (mit Rollback-Support)
CREATE TABLE task_content_log (
    id TEXT PRIMARY KEY,                    -- UUID
    task_id TEXT NOT NULL REFERENCES generation_tasks(id) ON DELETE CASCADE,

    -- Was wurde gemacht?
    entity_type TEXT NOT NULL,              -- 'cluster', 'variant', 'answer'
    entity_id TEXT NOT NULL,                -- UUID des betroffenen Objekts
    action TEXT NOT NULL,                   -- 'created', 'updated', 'deleted'

    -- Rollback-Daten
    previous_data TEXT,                     -- JSON: vorheriger Zustand (für Undo bei 'updated'/'deleted')

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices für effiziente Abfragen
CREATE INDEX idx_tasks_status ON generation_tasks(status);
CREATE INDEX idx_tasks_status_delayed ON generation_tasks(status, delayed_until);
CREATE INDEX idx_tasks_created ON generation_tasks(created_at);
CREATE INDEX idx_content_log_task ON task_content_log(task_id);
CREATE INDEX idx_content_log_entity ON task_content_log(entity_type, entity_id);
```

### Payload-Beispiele

**generate_clusters:**
```json
{
  "subject_id": "uuid-here",
  "count": 10,
  "variants_per_cluster": 5,
  "answers_per_variant": 4
}
```

**generate_variants:**
```json
{
  "cluster_id": "uuid-here",
  "count": 10,
  "answers_per_variant": 4
}
```

**regenerate_answers:**
```json
{
  "variant_id": "uuid-here",
  "count": 4
}
```

---

## API Endpoints (Task Management)

| Endpoint | Method | Beschreibung |
|----------|--------|--------------|
| `/tasks` | GET | Liste aller Tasks (Filter: `status`, `task_type`) |
| `/tasks/{id}` | GET | Task-Details inkl. Artefakte |
| `/tasks` | POST | Neuen Task erstellen |
| `/tasks/{id}/cancel` | POST | Task abbrechen |
| `/tasks/{id}/retry` | POST | Fehlgeschlagenen Task neu starten |
| `/tasks/{id}/accept` | POST | Task als akzeptiert markieren |
| `/tasks/{id}/revert` | POST | Alle Änderungen des Tasks rückgängig machen |

---

## Responsive Design

### Breakpoints

| Breakpoint | Breite | Zielgerät |
|------------|--------|-----------|
| `sm` | 640px | Mobile Portrait |
| `md` | 768px | Tablet / Mobile Landscape |
| `lg` | 1024px | Small Desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large Desktop |

### Mobile Adaptionen

| Komponente | Desktop | Mobile |
|------------|---------|--------|
| Navigation | Top-Bar | Bottom-Tab-Bar |
| Sidebar | Permanent | Slide-over / Bottom Sheet |
| Content Editor | Split View | Full-screen mit Back |
| Task Cards | Expanded | Compact, expandable |
| Generate Modal | Centered | Full-screen Bottom Sheet |

### Touch-Optimierungen

- Touch-Targets mindestens 44x44px
- Swipe-Gesten für Navigation (zurück, löschen)
- Pull-to-refresh für Task-Liste
- Long-press für Kontext-Menü

---

## Mockdaten (Entwicklung)

### Beispiel-Subject

```json
{
  "id": "subj-math-9",
  "key": "mathe-9-algebra",
  "name": "Mathematik 9 - Algebra"
}
```

### Beispiel-Cluster

```json
{
  "id": "clust-lin-eq",
  "subject_id": "subj-math-9",
  "topic": "Lineare Gleichungen lösen",
  "canonical_template": "Löse die Gleichung nach x auf",
  "difficulty_baseline": 4
}
```

### Beispiel-Variant mit Answers

```json
{
  "id": "var-001",
  "cluster_id": "clust-lin-eq",
  "question_text": "Löse die Gleichung: 2x + 3 = 7",
  "answers": [
    { "id": "ans-001", "answer_text": "x = 2", "is_correct": true },
    { "id": "ans-002", "answer_text": "x = 5", "is_correct": false },
    { "id": "ans-003", "answer_text": "x = -2", "is_correct": false },
    { "id": "ans-004", "answer_text": "x = 4", "is_correct": false }
  ]
}
```

---

## Implementierungs-Reihenfolge

### Phase 1: Foundation
1. Next.js Setup mit App Router
2. Tailwind + shadcn/ui Konfiguration
3. Dark/Light Mode Theme
4. Layout-Komponenten (TopNav, Sidebar, Page)
5. Mock-Auth (bypass für Entwicklung)

### Phase 2: Core UI
1. Login/Register Pages (UI only)
2. Dashboard mit Static Data
3. Content Editor - Subject List
4. Content Editor - Detail Views
5. Generate Modal

### Phase 3: Task Management
1. Task Liste
2. Task Detail / Progress
3. Task → Content Filter Integration

### Phase 4: Polish
1. Responsive Optimierungen
2. Animationen & Transitions
3. Error States & Loading States
4. Keyboard Navigation

---

## Offene Punkte (Später)

- [ ] OAuth-Integration (Google, GitHub, etc.)
- [ ] Knowledge Space Theory - Topic/Theme Editor
- [ ] Bulk-Operations im Content Editor
- [ ] Export/Import Funktionen
- [ ] Audit Log UI
- [ ] Statistiken & Reporting Dashboard
- [ ] LLM Usage Dashboard (Kosten-Tracking via `llm_usage_log` Tabelle)
- [ ] WebSocket/SSE für Live-Task-Updates (statt Polling)
- [ ] Task-Priorisierung (aktuell FIFO)
