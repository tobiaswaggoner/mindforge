"""SQLite implementation of ContentRepository."""

import aiosqlite
from typing import Any

from .content_repository import ContentRepository
from ..models.content import (
    Subject,
    QuestionCluster,
    QuestionVariant,
    Answer,
    QuestionWithAnswers,
)


class SQLiteContentRepository(ContentRepository):
    """SQLite implementation of ContentRepository.

    Uses aiosqlite for async SQLite operations.
    Suitable for local development and testing.
    """

    def __init__(self, database_path: str):
        """Initialize SQLite content repository.

        Args:
            database_path: Path to SQLite database file, or ':memory:' for in-memory
        """
        self._database_path = database_path
        self._connection: aiosqlite.Connection | None = None

    # -------------------------------------------------------------------------
    # Connection Management
    # -------------------------------------------------------------------------

    async def connect(self) -> None:
        """Establish database connection."""
        if self._connection is None:
            self._connection = await aiosqlite.connect(self._database_path)
            self._connection.row_factory = aiosqlite.Row
            await self._connection.execute("PRAGMA foreign_keys = ON")

    async def disconnect(self) -> None:
        """Close database connection."""
        if self._connection is not None:
            await self._connection.close()
            self._connection = None

    def _ensure_connected(self) -> aiosqlite.Connection:
        """Ensure connection is established."""
        if self._connection is None:
            raise RuntimeError("Repository not connected. Call connect() first.")
        return self._connection

    async def _execute(self, sql: str, params: tuple = ()) -> None:
        """Execute a SQL statement."""
        conn = self._ensure_connected()
        await conn.execute(sql, params)
        await conn.commit()

    async def _fetch_one(self, sql: str, params: tuple = ()) -> dict[str, Any] | None:
        """Fetch a single row."""
        conn = self._ensure_connected()
        cursor = await conn.execute(sql, params)
        row = await cursor.fetchone()
        return dict(row) if row else None

    async def _fetch_all(self, sql: str, params: tuple = ()) -> list[dict[str, Any]]:
        """Fetch all rows."""
        conn = self._ensure_connected()
        cursor = await conn.execute(sql, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

    # -------------------------------------------------------------------------
    # Subjects
    # -------------------------------------------------------------------------

    async def get_all_subjects(self) -> list[Subject]:
        rows = await self._fetch_all("SELECT * FROM subjects ORDER BY name")
        return [Subject(**row) for row in rows]

    async def get_subject_by_id(self, subject_id: str) -> Subject | None:
        row = await self._fetch_one("SELECT * FROM subjects WHERE id = ?", (subject_id,))
        return Subject(**row) if row else None

    async def get_subject_by_key(self, key: str) -> Subject | None:
        row = await self._fetch_one("SELECT * FROM subjects WHERE key = ?", (key,))
        return Subject(**row) if row else None

    async def create_subject(self, subject: Subject) -> Subject:
        await self._execute(
            "INSERT INTO subjects (id, key, name) VALUES (?, ?, ?)",
            (subject.id, subject.key, subject.name),
        )
        return subject

    async def update_subject(self, subject: Subject) -> Subject:
        await self._execute(
            "UPDATE subjects SET key = ?, name = ? WHERE id = ?",
            (subject.key, subject.name, subject.id),
        )
        return subject

    async def delete_subject(self, subject_id: str) -> bool:
        conn = self._ensure_connected()
        cursor = await conn.execute("DELETE FROM subjects WHERE id = ?", (subject_id,))
        await conn.commit()
        return cursor.rowcount > 0

    # -------------------------------------------------------------------------
    # Question Clusters
    # -------------------------------------------------------------------------

    async def get_clusters_by_subject(self, subject_id: str) -> list[QuestionCluster]:
        rows = await self._fetch_all(
            "SELECT * FROM question_clusters WHERE subject_id = ? ORDER BY topic",
            (subject_id,),
        )
        return [QuestionCluster(**row) for row in rows]

    async def get_cluster_by_id(self, cluster_id: str) -> QuestionCluster | None:
        row = await self._fetch_one(
            "SELECT * FROM question_clusters WHERE id = ?",
            (cluster_id,),
        )
        return QuestionCluster(**row) if row else None

    async def create_cluster(self, cluster: QuestionCluster) -> QuestionCluster:
        await self._execute(
            """INSERT INTO question_clusters
               (id, subject_id, topic, canonical_template, difficulty_baseline)
               VALUES (?, ?, ?, ?, ?)""",
            (cluster.id, cluster.subject_id, cluster.topic,
             cluster.canonical_template, cluster.difficulty_baseline),
        )
        return cluster

    async def update_cluster(self, cluster: QuestionCluster) -> QuestionCluster:
        await self._execute(
            """UPDATE question_clusters
               SET subject_id = ?, topic = ?, canonical_template = ?, difficulty_baseline = ?
               WHERE id = ?""",
            (cluster.subject_id, cluster.topic, cluster.canonical_template,
             cluster.difficulty_baseline, cluster.id),
        )
        return cluster

    async def delete_cluster(self, cluster_id: str) -> bool:
        # Foreign keys with CASCADE would handle this, but let's be explicit
        conn = self._ensure_connected()

        # Get all variants for this cluster
        variants = await self._fetch_all(
            "SELECT id FROM question_variants WHERE cluster_id = ?",
            (cluster_id,),
        )

        # Delete answers for all variants
        for variant in variants:
            await conn.execute(
                "DELETE FROM answers WHERE variant_id = ?",
                (variant["id"],),
            )

        # Delete variants
        await conn.execute(
            "DELETE FROM question_variants WHERE cluster_id = ?",
            (cluster_id,),
        )

        # Delete cluster
        cursor = await conn.execute(
            "DELETE FROM question_clusters WHERE id = ?",
            (cluster_id,),
        )
        await conn.commit()
        return cursor.rowcount > 0

    # -------------------------------------------------------------------------
    # Question Variants
    # -------------------------------------------------------------------------

    async def get_variants_by_cluster(self, cluster_id: str) -> list[QuestionVariant]:
        rows = await self._fetch_all(
            "SELECT * FROM question_variants WHERE cluster_id = ?",
            (cluster_id,),
        )
        return [QuestionVariant(**row) for row in rows]

    async def get_variant_by_id(self, variant_id: str) -> QuestionVariant | None:
        row = await self._fetch_one(
            "SELECT * FROM question_variants WHERE id = ?",
            (variant_id,),
        )
        return QuestionVariant(**row) if row else None

    async def get_random_variant_for_cluster(self, cluster_id: str) -> QuestionVariant | None:
        row = await self._fetch_one(
            "SELECT * FROM question_variants WHERE cluster_id = ? ORDER BY RANDOM() LIMIT 1",
            (cluster_id,),
        )
        return QuestionVariant(**row) if row else None

    async def create_variant(self, variant: QuestionVariant) -> QuestionVariant:
        await self._execute(
            "INSERT INTO question_variants (id, cluster_id, question_text) VALUES (?, ?, ?)",
            (variant.id, variant.cluster_id, variant.question_text),
        )
        return variant

    async def update_variant(self, variant: QuestionVariant) -> QuestionVariant:
        await self._execute(
            "UPDATE question_variants SET cluster_id = ?, question_text = ? WHERE id = ?",
            (variant.cluster_id, variant.question_text, variant.id),
        )
        return variant

    async def delete_variant(self, variant_id: str) -> bool:
        conn = self._ensure_connected()
        # Delete answers first
        await conn.execute("DELETE FROM answers WHERE variant_id = ?", (variant_id,))
        # Delete variant
        cursor = await conn.execute(
            "DELETE FROM question_variants WHERE id = ?",
            (variant_id,),
        )
        await conn.commit()
        return cursor.rowcount > 0

    # -------------------------------------------------------------------------
    # Answers
    # -------------------------------------------------------------------------

    async def get_answers_by_variant(self, variant_id: str) -> list[Answer]:
        rows = await self._fetch_all(
            "SELECT * FROM answers WHERE variant_id = ?",
            (variant_id,),
        )
        return [Answer(**row) for row in rows]

    async def create_answer(self, answer: Answer) -> Answer:
        await self._execute(
            "INSERT INTO answers (id, variant_id, answer_text, is_correct) VALUES (?, ?, ?, ?)",
            (answer.id, answer.variant_id, answer.answer_text, 1 if answer.is_correct else 0),
        )
        return answer

    async def create_answers_bulk(self, answers: list[Answer]) -> list[Answer]:
        conn = self._ensure_connected()
        await conn.executemany(
            "INSERT INTO answers (id, variant_id, answer_text, is_correct) VALUES (?, ?, ?, ?)",
            [(a.id, a.variant_id, a.answer_text, 1 if a.is_correct else 0) for a in answers],
        )
        await conn.commit()
        return answers

    async def update_answer(self, answer: Answer) -> Answer:
        await self._execute(
            "UPDATE answers SET variant_id = ?, answer_text = ?, is_correct = ? WHERE id = ?",
            (answer.variant_id, answer.answer_text, 1 if answer.is_correct else 0, answer.id),
        )
        return answer

    async def delete_answer(self, answer_id: str) -> bool:
        conn = self._ensure_connected()
        cursor = await conn.execute("DELETE FROM answers WHERE id = ?", (answer_id,))
        await conn.commit()
        return cursor.rowcount > 0

    # -------------------------------------------------------------------------
    # Convenience Methods
    # -------------------------------------------------------------------------

    async def get_question_with_answers(self, variant_id: str) -> QuestionWithAnswers | None:
        variant = await self.get_variant_by_id(variant_id)
        if not variant:
            return None

        answers = await self.get_answers_by_variant(variant_id)
        cluster = await self.get_cluster_by_id(variant.cluster_id)
        subject = None
        if cluster:
            subject = await self.get_subject_by_id(cluster.subject_id)

        return QuestionWithAnswers(
            variant=variant,
            answers=answers,
            cluster=cluster,
            subject=subject,
        )

    async def get_random_question_for_subject(self, subject_key: str) -> QuestionWithAnswers | None:
        # Get subject
        subject = await self.get_subject_by_key(subject_key)
        if not subject:
            return None

        # Get random variant for this subject
        row = await self._fetch_one(
            """SELECT qv.* FROM question_variants qv
               JOIN question_clusters qc ON qv.cluster_id = qc.id
               WHERE qc.subject_id = ?
               ORDER BY RANDOM() LIMIT 1""",
            (subject.id,),
        )
        if not row:
            return None

        variant = QuestionVariant(**row)
        answers = await self.get_answers_by_variant(variant.id)
        cluster = await self.get_cluster_by_id(variant.cluster_id)

        return QuestionWithAnswers(
            variant=variant,
            answers=answers,
            cluster=cluster,
            subject=subject,
        )
