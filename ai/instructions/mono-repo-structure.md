# Monorepo-Struktur

## Übersicht

MindForge ist ein Monorepo mit mehreren Anwendungen, die unterschiedliche Tech-Stacks verwenden können.

## Verzeichnisstruktur

```
mindforge/
├── .github/                        # CI/CD Workflows (GitHub Actions)
├── .vscode/                        # Geteilte Editor-Einstellungen
├── ai/                             # AI-Konfiguration
│   ├── instructions/               # Projektweite Anweisungen
│   └── prompts/                    # LLM-Prompts für Generierung
│
├── apps/                           # Lauffähige Anwendungen
│   ├── backend/                    # Python API (zentral für alle Frontends)
│   │   ├── src/
│   │   │   ├── api/                # API Routes
│   │   │   ├── services/           # Business Logic (LLM-Pipelines)
│   │   │   └── models/             # Data Models
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   └── main.py
│   │
│   ├── admin/                      # Admin UI (Next.js + Tailwind + ShadCN)
│   │   ├── src/
│   │   │   ├── app/                # Next.js App Router
│   │   │   ├── components/
│   │   │   └── lib/
│   │   ├── package.json
│   │   └── ...
│   │
│   └── [tutor]/                    # (Zukünftig) KI-Tutor Frontend
│
├── packages/                       # Geteilter Code (nicht eigenständig lauffähig)
│   ├── db/                         # Datenbank-Abstraktionsschicht
│   │   ├── python/                 # Python-Implementation
│   │   └── typescript/             # TypeScript-Implementation
│   └── types/                      # Geteilte Typdefinitionen
│       ├── python/
│       └── typescript/
│
├── docs/                           # Dokumentation
│   ├── brainstorming/              # Historische Konzepte (archiviert)
│   └── architecture/               # Aktuelle Architektur-Dokumentation
│
├── tools/                          # Interne Werkzeuge
│   └── scripts/                    # Helper-Skripte
│
├── CLAUDE.md                       # Haupt-Projektbeschreibung
└── README.md                       # Öffentliche Projektbeschreibung
```

## Apps

Jede App unter `apps/` ist eine eigenständige, deploybare Anwendung.

### Aktuelle Apps

| App | Typ | Tech-Stack | Zweck |
|-----|-----|------------|-------|
| `backend` | API | Python (FastAPI) | Zentrale API für alle Frontends, LLM-Pipelines |
| `admin` | Frontend | Next.js + Tailwind + ShadCN | Content-Generierung & -Verwaltung |
| `[tutor]` | Frontend | Next.js (geplant) | KI-Tutor für Schüler |

### Backend-Struktur

```
apps/backend/
├── src/
│   ├── api/                        # API Routes (FastAPI)
│   │   ├── questions.py
│   │   ├── clusters.py
│   │   └── generation.py
│   ├── services/                   # Business Logic
│   │   ├── llm/                    # LLM-Provider-Abstraktion
│   │   │   ├── base.py
│   │   │   └── openai.py
│   │   └── generators/             # Content-Generierung
│   │       └── variant_generator.py
│   └── models/                     # Pydantic Models
├── tests/
├── requirements.txt
├── pyproject.toml
└── main.py
```

### Frontend-Struktur (Next.js)

```
apps/admin/  (oder apps/tutor/)
├── src/
│   ├── app/                        # Next.js App Router
│   ├── components/                 # React Components
│   ├── hooks/                      # Custom Hooks
│   └── lib/                        # Utilities
├── public/                         # Static Assets
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Packages

Code unter `packages/` ist wiederverwendbar und wird von mehreren Apps importiert.

### Datenbank-Package (`packages/db/`)

Abstrahiert SQLite (lokal) und Supabase (prod):

```python
# Python Usage (im Backend)
from packages.db import get_connection, Question

conn = get_connection()  # Automatisch SQLite oder Supabase
questions = Question.all(conn)
```

```typescript
// TypeScript Usage (in Frontends, falls direkt benötigt)
import { getConnection, Question } from '@mindforge/db';

const conn = getConnection();
const questions = await Question.all(conn);
```

### Types-Package (`packages/types/`)

Geteilte Typdefinitionen für Konsistenz:

```python
# Python
from packages.types import QuestionCluster, QuestionVariant
```

```typescript
// TypeScript
import type { QuestionCluster, QuestionVariant } from '@mindforge/types';
```

## Konventionen

### Naming

- **Verzeichnisse**: kebab-case (`admin/`, `backend/`)
- **Python-Dateien**: snake_case (`question_generator.py`)
- **TypeScript-Dateien**: camelCase oder PascalCase für Components (`QuestionList.tsx`)

### Dependencies

- **App-spezifische Dependencies**: In der jeweiligen App (`apps/backend/requirements.txt`)
- **Geteilte Dependencies**: In `packages/` mit Versionsmanagement

### Environment Variables

```
# .env.local (nicht commiten)
DATABASE_URL=sqlite:///data/local.db
OPENAI_API_KEY=sk-...

# .env.production (via CI/CD)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...
```

## Entwicklungs-Workflow

### Neue Frontend-App anlegen

```bash
cd apps
mkdir [name]
cd [name]
npx create-next-app@latest . --typescript --tailwind --app
npx shadcn@latest init
```

### Lokale Entwicklung

```bash
# Terminal 1: Backend
cd apps/backend
source venv/bin/activate  # oder venv\Scripts\activate auf Windows
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend (Admin)
cd apps/admin
npm run dev
```

### Tests

```bash
# Python Tests
cd apps/backend
pytest

# TypeScript Tests
cd apps/admin
npm test
```
