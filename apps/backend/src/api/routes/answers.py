"""Answer CRUD endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...models import Answer
from ...repositories import SQLiteContentRepository
from ...config import settings

router = APIRouter(prefix="/answers", tags=["answers"])


def _get_database_path() -> str:
    """Extract SQLite database path from connection URL."""
    url = settings.database_url
    if url.startswith("sqlite+aiosqlite:///"):
        return url.replace("sqlite+aiosqlite:///", "")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "")
    raise ValueError(f"Unsupported database URL: {url}")


class AnswerCreate(BaseModel):
    """Request model for creating an answer."""
    variant_id: str
    answer_text: str
    is_correct: bool = False


class AnswerBulkCreate(BaseModel):
    """Request model for creating multiple answers at once."""
    variant_id: str
    answers: list[dict]  # [{"answer_text": "...", "is_correct": bool}, ...]


class AnswerUpdate(BaseModel):
    """Request model for updating an answer."""
    variant_id: str | None = None
    answer_text: str | None = None
    is_correct: bool | None = None


@router.get("", response_model=list[Answer])
async def list_answers(variant_id: str) -> list[Answer]:
    """Get all answers for a variant."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        return await repo.get_answers_by_variant(variant_id)
    finally:
        await repo.disconnect()


@router.post("", response_model=Answer, status_code=201)
async def create_answer(data: AnswerCreate) -> Answer:
    """Create a new answer."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        # Verify variant exists
        variant = await repo.get_variant_by_id(data.variant_id)
        if not variant:
            raise HTTPException(status_code=404, detail="Variant not found")

        answer = Answer(
            variant_id=data.variant_id,
            answer_text=data.answer_text,
            is_correct=data.is_correct,
        )
        return await repo.create_answer(answer)
    finally:
        await repo.disconnect()


@router.post("/bulk", response_model=list[Answer], status_code=201)
async def create_answers_bulk(data: AnswerBulkCreate) -> list[Answer]:
    """Create multiple answers at once for a variant."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        # Verify variant exists
        variant = await repo.get_variant_by_id(data.variant_id)
        if not variant:
            raise HTTPException(status_code=404, detail="Variant not found")

        answers = [
            Answer(
                variant_id=data.variant_id,
                answer_text=a["answer_text"],
                is_correct=a.get("is_correct", False),
            )
            for a in data.answers
        ]
        return await repo.create_answers_bulk(answers)
    finally:
        await repo.disconnect()


@router.put("/{answer_id}", response_model=Answer)
async def update_answer(answer_id: str, data: AnswerUpdate) -> Answer:
    """Update an existing answer."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        # Get existing answers to find the one we want
        # Note: We need a get_answer_by_id method, let's work around it
        answers = await repo.get_answers_by_variant(data.variant_id) if data.variant_id else []
        answer = next((a for a in answers if a.id == answer_id), None)

        if not answer:
            # Try to find in all variants (slower)
            subjects = await repo.get_all_subjects()
            for subject in subjects:
                clusters = await repo.get_clusters_by_subject(subject.id)
                for cluster in clusters:
                    variants = await repo.get_variants_by_cluster(cluster.id)
                    for variant in variants:
                        variant_answers = await repo.get_answers_by_variant(variant.id)
                        answer = next((a for a in variant_answers if a.id == answer_id), None)
                        if answer:
                            break
                    if answer:
                        break
                if answer:
                    break

        if not answer:
            raise HTTPException(status_code=404, detail="Answer not found")

        if data.variant_id is not None:
            # Verify new variant exists
            variant = await repo.get_variant_by_id(data.variant_id)
            if not variant:
                raise HTTPException(status_code=404, detail="Variant not found")
            answer.variant_id = data.variant_id
        if data.answer_text is not None:
            answer.answer_text = data.answer_text
        if data.is_correct is not None:
            answer.is_correct = data.is_correct

        return await repo.update_answer(answer)
    finally:
        await repo.disconnect()


@router.delete("/{answer_id}", status_code=204)
async def delete_answer(answer_id: str) -> None:
    """Delete an answer."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        deleted = await repo.delete_answer(answer_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Answer not found")
    finally:
        await repo.disconnect()
