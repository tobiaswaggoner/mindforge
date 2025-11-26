# CLAUDE.md

Diese Datei gibt Claude Code (claude.ai/code) Orientierung bei der Arbeit mit dem Code in diesem Repository.

## Projektübersicht

**MindForge** ist die Content Engine für das KI-gestützte Lern-Ökosystem. Die Kernaufgabe ist die AI-gestützte Generierung, Verwaltung und Qualitätssicherung von Lerninhalten (Fragen, Antworten, Varianten).

### Projekt-Ökosystem

| Repository | Zweck | Status |
|------------|-------|--------|
| **mindforge** (dieses Repo) | Content Engine & Admin Backend | Aktiv |
| **dungeons-and-diplomas** | Game-basiertes Assessment Tool | Aktiv |
| **mindforge_work** | Projekt-Wiki & Konzepte | Referenz |

### Aktueller Fokus

1. **Admin Backend** - UI zur Steuerung der Content-Generierung
2. **Content Pipeline** - AI-gestützte Fragen- und Varianten-Generierung
3. **Datenbank-Abstraktionsschicht** - SQLite (lokal) / Supabase (deployed)

---

## Architektur

### Monorepo-Struktur

```
mindforge/
├── apps/                           # Lauffähige Anwendungen
│   ├── backend/                    # Python API (zentral für alle Frontends)
│   │   └── src/
│   ├── admin/                      # Admin UI (Next.js + Tailwind + ShadCN)
│   └── [tutor]/                    # (Zukünftig) KI-Tutor App
├── packages/                       # Geteilter Code
│   ├── db/                         # Datenbank-Abstraktionsschicht
│   └── types/                      # Geteilte TypeScript/Python Types
├── ai/                             # AI-Konfiguration & Prompts
│   └── instructions/
├── docs/                           # Dokumentation
│   ├── brainstorming/              # Historische Konzepte
│   └── architecture/               # Aktuelle Architektur-Docs
└── tools/                          # Interne Hilfswerkzeuge
```

### Tech Stack

| Komponente | Technologie | Anmerkungen |
|------------|-------------|-------------|
| **Frontend** | Next.js + Tailwind + ShadCN | Für alle Web-UIs |
| **Backend** | Python (FastAPI/Flask) | Für LLM-Pipelines |
| **Datenbank** | SQLite (lokal) / Supabase (prod) | Mit Abstraktionsschicht |
| **LLM** | OpenAI (GPT-5.1) | Abstrahiert für Provider-Wechsel |

### Datenbank-Strategie

- **Lokale Entwicklung**: SQLite
- **Deployment**: Supabase (PostgreSQL)
- **Abstraktionsschicht**: Einheitliches Interface für beide Backends

---

## Architektur-Dokumentation

Detaillierte Dokumentation in `docs/architecture/`:

- **[database-schema.md](docs/architecture/database-schema.md)** - Datenbank-Schema (Subjects, Clusters, Variants, Answers)

---

## Entwicklungs-Befehle

### Backend (Python API)

```bash
cd apps/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Admin UI (Next.js)

```bash
cd apps/admin
npm install
npm run dev
```

### Datenbank

```bash
# Lokale SQLite initialisieren
python -m packages.db.init

# Supabase Migration (Deployment)
supabase db push
```

---

## Coding-Konventionen

### Sprache

- **Code & Kommentare**: Englisch
- **UI-Texte**: Deutsch
- **Dokumentation**: Deutsch (dieses Repo), Englisch (Code-Docs)

### Code-Style

- **Python**: PEP 8, Type Hints
- **TypeScript**: ESLint + Prettier
- **Commits**: Conventional Commits (feat, fix, docs, ...)

---

## Schnittstelle zu D&D

MindForge und D&D teilen sich die gleiche Datenbank und Abstraktionsschicht:

- **Geteilte Datenbank**: Gleiche SQLite/Supabase-Instanz
- **Gemeinsames Schema**: Siehe [database-schema.md](docs/architecture/database-schema.md)
- **Question-Selection**: D&D wählt zufällige Variante aus Cluster
