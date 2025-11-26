"""Initial database schema for MindForge Content Engine.

Creates the core tables:
- subjects: Subject areas (e.g., "Mathematik")
- question_clusters: Canonical question groupings
- question_variants: Specific question instances
- answers: Answer options for questions
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ...adapter import DatabaseAdapter

NAME = "m001_initial_schema"


async def up(adapter: "DatabaseAdapter") -> None:
    """Create initial schema."""
    await adapter.executescript("""
        -- Subjects (Fächer)
        CREATE TABLE subjects (
            id TEXT PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL
        );

        -- Question Clusters (übergeordnet, ohne Fragetext)
        CREATE TABLE question_clusters (
            id TEXT PRIMARY KEY,
            subject_id TEXT NOT NULL REFERENCES subjects(id),
            topic TEXT NOT NULL,
            canonical_template TEXT,
            difficulty_baseline INTEGER DEFAULT 5
        );

        -- Question Variants (mit Fragetext)
        CREATE TABLE question_variants (
            id TEXT PRIMARY KEY,
            cluster_id TEXT NOT NULL REFERENCES question_clusters(id),
            question_text TEXT NOT NULL
        );

        -- Answers
        CREATE TABLE answers (
            id TEXT PRIMARY KEY,
            variant_id TEXT NOT NULL REFERENCES question_variants(id),
            answer_text TEXT NOT NULL,
            is_correct INTEGER NOT NULL DEFAULT 0
        );

        -- Indices for performance
        CREATE INDEX idx_clusters_subject ON question_clusters(subject_id);
        CREATE INDEX idx_variants_cluster ON question_variants(cluster_id);
        CREATE INDEX idx_answers_variant ON answers(variant_id);
    """)
