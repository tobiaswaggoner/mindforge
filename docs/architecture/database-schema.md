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

## D&D-Kompatibilität

Dungeons & Diplomas wird auf dieses Schema migriert. Die bisherige flache `questions`-Tabelle wird ersetzt durch die neue Struktur.
