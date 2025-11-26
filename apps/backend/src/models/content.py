"""Content domain models."""

from pydantic import BaseModel, Field
from uuid import uuid4


def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid4())


class Subject(BaseModel):
    """A subject area (e.g., Mathematics, German)."""

    id: str = Field(default_factory=generate_uuid)
    key: str  # e.g., "mathe"
    name: str  # e.g., "Mathematik"


class QuestionCluster(BaseModel):
    """A canonical question grouping without specific question text.

    Represents the abstract concept of a question type.
    E.g., "Solve linear equation" without specific numbers.
    """

    id: str = Field(default_factory=generate_uuid)
    subject_id: str
    topic: str
    canonical_template: str | None = None
    difficulty_baseline: int = 5


class QuestionVariant(BaseModel):
    """A specific question instance with actual question text.

    E.g., "Solve: 2x + 3 = 7" as a variant of "Solve linear equation".
    """

    id: str = Field(default_factory=generate_uuid)
    cluster_id: str
    question_text: str


class Answer(BaseModel):
    """An answer option for a question variant."""

    id: str = Field(default_factory=generate_uuid)
    variant_id: str
    answer_text: str
    is_correct: bool = False


class QuestionWithAnswers(BaseModel):
    """A question variant with its answers - convenience model for queries."""

    variant: QuestionVariant
    answers: list[Answer]
    cluster: QuestionCluster | None = None
    subject: Subject | None = None
