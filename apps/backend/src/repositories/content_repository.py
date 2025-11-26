"""Abstract Content Repository interface."""

from abc import ABC, abstractmethod

from ..models.content import (
    Subject,
    QuestionCluster,
    QuestionVariant,
    Answer,
    QuestionWithAnswers,
)


class ContentRepository(ABC):
    """Abstract interface for content data access.

    Implementations:
    - SQLiteContentRepository: For local development and testing
    - SupabaseContentRepository: For production deployment (future)
    """

    # -------------------------------------------------------------------------
    # Connection Management
    # -------------------------------------------------------------------------

    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to data store."""
        ...

    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection to data store."""
        ...

    # -------------------------------------------------------------------------
    # Subjects
    # -------------------------------------------------------------------------

    @abstractmethod
    async def get_all_subjects(self) -> list[Subject]:
        """Get all subjects."""
        ...

    @abstractmethod
    async def get_subject_by_id(self, subject_id: str) -> Subject | None:
        """Get a subject by ID."""
        ...

    @abstractmethod
    async def get_subject_by_key(self, key: str) -> Subject | None:
        """Get a subject by its unique key."""
        ...

    @abstractmethod
    async def create_subject(self, subject: Subject) -> Subject:
        """Create a new subject."""
        ...

    @abstractmethod
    async def update_subject(self, subject: Subject) -> Subject:
        """Update an existing subject."""
        ...

    @abstractmethod
    async def delete_subject(self, subject_id: str) -> bool:
        """Delete a subject. Returns True if deleted, False if not found."""
        ...

    # -------------------------------------------------------------------------
    # Question Clusters
    # -------------------------------------------------------------------------

    @abstractmethod
    async def get_clusters_by_subject(self, subject_id: str) -> list[QuestionCluster]:
        """Get all clusters for a subject."""
        ...

    @abstractmethod
    async def get_cluster_by_id(self, cluster_id: str) -> QuestionCluster | None:
        """Get a cluster by ID."""
        ...

    @abstractmethod
    async def create_cluster(self, cluster: QuestionCluster) -> QuestionCluster:
        """Create a new question cluster."""
        ...

    @abstractmethod
    async def update_cluster(self, cluster: QuestionCluster) -> QuestionCluster:
        """Update an existing cluster."""
        ...

    @abstractmethod
    async def delete_cluster(self, cluster_id: str) -> bool:
        """Delete a cluster and all its variants/answers."""
        ...

    # -------------------------------------------------------------------------
    # Question Variants
    # -------------------------------------------------------------------------

    @abstractmethod
    async def get_variants_by_cluster(self, cluster_id: str) -> list[QuestionVariant]:
        """Get all variants for a cluster."""
        ...

    @abstractmethod
    async def get_variant_by_id(self, variant_id: str) -> QuestionVariant | None:
        """Get a variant by ID."""
        ...

    @abstractmethod
    async def get_random_variant_for_cluster(self, cluster_id: str) -> QuestionVariant | None:
        """Get a random variant from a cluster (for gameplay)."""
        ...

    @abstractmethod
    async def create_variant(self, variant: QuestionVariant) -> QuestionVariant:
        """Create a new question variant."""
        ...

    @abstractmethod
    async def update_variant(self, variant: QuestionVariant) -> QuestionVariant:
        """Update an existing variant."""
        ...

    @abstractmethod
    async def delete_variant(self, variant_id: str) -> bool:
        """Delete a variant and all its answers."""
        ...

    # -------------------------------------------------------------------------
    # Answers
    # -------------------------------------------------------------------------

    @abstractmethod
    async def get_answers_by_variant(self, variant_id: str) -> list[Answer]:
        """Get all answers for a variant."""
        ...

    @abstractmethod
    async def create_answer(self, answer: Answer) -> Answer:
        """Create a new answer."""
        ...

    @abstractmethod
    async def create_answers_bulk(self, answers: list[Answer]) -> list[Answer]:
        """Create multiple answers at once."""
        ...

    @abstractmethod
    async def update_answer(self, answer: Answer) -> Answer:
        """Update an existing answer."""
        ...

    @abstractmethod
    async def delete_answer(self, answer_id: str) -> bool:
        """Delete an answer."""
        ...

    # -------------------------------------------------------------------------
    # Convenience Methods
    # -------------------------------------------------------------------------

    @abstractmethod
    async def get_question_with_answers(self, variant_id: str) -> QuestionWithAnswers | None:
        """Get a complete question with all its answers."""
        ...

    @abstractmethod
    async def get_random_question_for_subject(self, subject_key: str) -> QuestionWithAnswers | None:
        """Get a random question with answers for a subject (for gameplay)."""
        ...
