"""Question Variant CRUD endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...models import QuestionVariant, QuestionWithAnswers
from ...repositories import SQLiteContentRepository
from ...config import settings

router = APIRouter(prefix="/variants", tags=["variants"])


def _get_database_path() -> str:
    """Extract SQLite database path from connection URL."""
    url = settings.database_url
    if url.startswith("sqlite+aiosqlite:///"):
        return url.replace("sqlite+aiosqlite:///", "")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "")
    raise ValueError(f"Unsupported database URL: {url}")


class VariantCreate(BaseModel):
    """Request model for creating a variant."""
    cluster_id: str
    question_text: str


class VariantUpdate(BaseModel):
    """Request model for updating a variant."""
    cluster_id: str | None = None
    question_text: str | None = None


@router.get("", response_model=list[QuestionVariant])
async def list_variants(cluster_id: str | None = None) -> list[QuestionVariant]:
    """Get all variants, optionally filtered by cluster."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        if cluster_id:
            return await repo.get_variants_by_cluster(cluster_id)
        # Get all variants (expensive, consider pagination later)
        subjects = await repo.get_all_subjects()
        all_variants = []
        for subject in subjects:
            clusters = await repo.get_clusters_by_subject(subject.id)
            for cluster in clusters:
                variants = await repo.get_variants_by_cluster(cluster.id)
                all_variants.extend(variants)
        return all_variants
    finally:
        await repo.disconnect()


@router.get("/{variant_id}", response_model=QuestionVariant)
async def get_variant(variant_id: str) -> QuestionVariant:
    """Get a variant by ID."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        variant = await repo.get_variant_by_id(variant_id)
        if not variant:
            raise HTTPException(status_code=404, detail="Variant not found")
        return variant
    finally:
        await repo.disconnect()


@router.get("/{variant_id}/full", response_model=QuestionWithAnswers)
async def get_variant_with_answers(variant_id: str) -> QuestionWithAnswers:
    """Get a variant with all its answers, cluster, and subject info."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        question = await repo.get_question_with_answers(variant_id)
        if not question:
            raise HTTPException(status_code=404, detail="Variant not found")
        return question
    finally:
        await repo.disconnect()


@router.post("", response_model=QuestionVariant, status_code=201)
async def create_variant(data: VariantCreate) -> QuestionVariant:
    """Create a new question variant."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        # Verify cluster exists
        cluster = await repo.get_cluster_by_id(data.cluster_id)
        if not cluster:
            raise HTTPException(status_code=404, detail="Cluster not found")

        variant = QuestionVariant(
            cluster_id=data.cluster_id,
            question_text=data.question_text,
        )
        return await repo.create_variant(variant)
    finally:
        await repo.disconnect()


@router.put("/{variant_id}", response_model=QuestionVariant)
async def update_variant(variant_id: str, data: VariantUpdate) -> QuestionVariant:
    """Update an existing variant."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        variant = await repo.get_variant_by_id(variant_id)
        if not variant:
            raise HTTPException(status_code=404, detail="Variant not found")

        if data.cluster_id is not None:
            # Verify new cluster exists
            cluster = await repo.get_cluster_by_id(data.cluster_id)
            if not cluster:
                raise HTTPException(status_code=404, detail="Cluster not found")
            variant.cluster_id = data.cluster_id
        if data.question_text is not None:
            variant.question_text = data.question_text

        return await repo.update_variant(variant)
    finally:
        await repo.disconnect()


@router.delete("/{variant_id}", status_code=204)
async def delete_variant(variant_id: str) -> None:
    """Delete a variant and all its answers."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        deleted = await repo.delete_variant(variant_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Variant not found")
    finally:
        await repo.disconnect()
