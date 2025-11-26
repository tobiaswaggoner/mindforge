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

## Datenmodell (Content)

### Kernentitäten

```
Subject (Fach)
  └── QuestionCluster (Kanonische Frage)
        ├── cluster_id (z.B. "mathe_gleichung_linear_01")
        ├── topic (z.B. "Lineare Gleichungen")
        ├── canonical_template
        └── QuestionVariant[]
              ├── question_text
              ├── answers[]
              ├── correct_index
              └── variant_id
```

### Datenbank-Schema (Erweiterung zu D&D)

```sql
-- Cluster-Metadaten
CREATE TABLE question_clusters (
  id TEXT PRIMARY KEY,
  subject_key TEXT NOT NULL,
  topic TEXT NOT NULL,
  canonical_template TEXT,
  difficulty_baseline INTEGER DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Erweiterte Questions-Tabelle
-- (kompatibel mit D&D, erweitert um cluster_id)
ALTER TABLE questions ADD COLUMN cluster_id TEXT REFERENCES question_clusters(id);
```

---

## LLM-Integration

### Provider-Abstraktion

```python
# Abstraktes Interface
class LLMProvider:
    def generate(self, prompt: str, model: str) -> str: ...

# Konkrete Implementierungen
class OpenAIProvider(LLMProvider): ...
class AnthropicProvider(LLMProvider): ...  # Zukünftig
```

### Modell-Konfiguration

- **Standard**: GPT-5.1 (OpenAI)
- **Konfigurierbar**: Modell pro Use-Case wählbar
- **Kostenoptimierung**: Günstigere Modelle für einfache Tasks

---

## Tracking-System (Geplant)

Für Audit, Rollback und Qualitätssicherung:

### IDs

| ID-Typ | Zweck |
|--------|-------|
| **Generation Session ID** | Gruppiert alle Generierungen einer Session |
| **Correlation ID** | Verknüpft einen Request mit allen Ergebnissen |

### Tracking-Tabelle (Konzept)

```sql
CREATE TABLE generation_tracking (
  id INTEGER PRIMARY KEY,
  session_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,      -- 'question', 'variant', 'cluster'
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,           -- 'created', 'updated', 'deleted'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Use Cases

- Audit-Log: "Wer hat wann was generiert?"
- Rollback: "Lösche alle Fragen aus Session X"
- Analyse: "Qualität der Generierungen von gestern"

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

MindForge generiert Content, der von D&D konsumiert wird:

- **Geteilte Datenbank**: Gleiche SQLite/Supabase-Instanz
- **Fragen-Format**: Kompatibel mit D&D `questions`-Tabelle
- **Neue Felder**: `cluster_id` für Varianten-Gruppierung

### D&D Anpassungen (separat)

- Question-Selection: Cluster → zufällige Variante
- Tracking: `answer_log` bleibt unverändert (referenziert `question_id`)
