# Datenbank-Schema

## Übersicht

MindForge und Dungeons & Diplomas teilen sich eine gemeinsame Datenbank mit einer Abstraktionsschicht für SQLite (lokal) und Supabase (prod).

## Kernkonzept

```
Subject (Fach)
  └── QuestionCluster (übergeordnet, OHNE Fragetext)
        └── QuestionVariant (mit Fragetext)
              └── Answer[]
```

- **QuestionCluster**: Repräsentiert eine kanonische Frage (z.B. "Löse lineare Gleichung")
- **QuestionVariant**: Äquivalente Varianten derselben Frage (z.B. "2x+3=7" vs "4x+1=9")
- **Answer**: Einzelne Antwortoptionen, werden bei Anzeige gemischt

## Schema

Alle Primary Keys sind UUIDs für einfache Verlinkung zwischen Systemen.

```sql
-- Fächer (später KST-Erweiterung geplant)
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,              -- UUID
  key TEXT UNIQUE NOT NULL,         -- z.B. "mathe"
  name TEXT NOT NULL                -- z.B. "Mathematik"
);

-- Cluster (übergeordnet, ohne Fragetext)
CREATE TABLE question_clusters (
  id TEXT PRIMARY KEY,              -- UUID
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  topic TEXT NOT NULL,
  canonical_template TEXT,
  difficulty_baseline INTEGER DEFAULT 5
);

-- Varianten (mit Fragetext)
CREATE TABLE question_variants (
  id TEXT PRIMARY KEY,              -- UUID
  cluster_id TEXT NOT NULL REFERENCES question_clusters(id),
  question_text TEXT NOT NULL
);

-- Antworten
CREATE TABLE answers (
  id TEXT PRIMARY KEY,              -- UUID
  variant_id TEXT NOT NULL REFERENCES question_variants(id),
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indices
CREATE INDEX idx_clusters_subject ON question_clusters(subject_id);
CREATE INDEX idx_variants_cluster ON question_variants(cluster_id);
CREATE INDEX idx_answers_variant ON answers(variant_id);
```

## Geplante Erweiterungen

### Audit-Tabellen (Event-Sourcing-ähnlich)

Alle Modifikations-Metadaten (created_at, updated_at, created_by) werden in separaten Audit-Tabellen geloggt statt in den Entitäten selbst.

### Diagnostic Distractors

```sql
-- Später in answers:
ALTER TABLE answers ADD COLUMN distractor_tags TEXT;  -- JSON Array
```

Ermöglicht Diagnostik: Wenn Spieler häufig Antworten mit Tag `skill_gap_vorzeichen` wählt, liegt das Problem in Grundrechenarten.

### Knowledge Space Theory (KST)

Subjects werden hierarchisch erweitert:
```
Class → Subject → Theme → Topic → QuestionCluster
```

Mit Predecessor/Successor-Relationen für adaptive Lernpfade.

## Migrations-Strategie

### Lokale Entwicklung (SQLite)

Eigenes leichtgewichtiges Migrationssystem in `apps/backend/src/db/migrations/`:

- Migrationen liegen in `versions/m001_name.py`, `m002_name.py`, etc.
- Tracking via `_migrations`-Tabelle
- API-Endpoints: `GET /migrations/status`, `POST /migrations/run`, `GET /migrations/history`
- Bewusster Aufruf (kein Auto-Migrate beim Start)

### Produktion (Supabase)

> **Hinweis:** Siehe [cloud.md](cloud.md) für Deployment-Details.

Supabase hat ein eigenes CLI-basiertes Migrationssystem. **Unser Python-Migrationssystem wird in Produktion NICHT verwendet.**

**Warum?**
- Supabase erlaubt kein `CREATE TABLE` über die REST-API
- Supabase CLI verwaltet Migrationen in `supabase/migrations/`
- Schema-Änderungen werden über Supabase Dashboard oder CLI deployed

**Workflow für Produktion:**
1. Schema-Änderungen lokal in SQLite entwickeln und testen
2. Entsprechende SQL-Migration für Supabase erstellen (`supabase migration new`)
3. Via `supabase db push` deployen
4. Der `SupabaseAdapter` greift nur auf bestehende Tabellen zu (CRUD)

**Referenz:** [Supabase Database Migrations Docs](https://supabase.com/docs/guides/deployment/database-migrations)

## D&D-Kompatibilität

Dungeons & Diplomas wird auf dieses Schema migriert. Die bisherige flache `questions`-Tabelle wird ersetzt durch die neue Struktur.
