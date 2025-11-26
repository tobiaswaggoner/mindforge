"""Question Cluster CRUD endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...models import QuestionCluster
from ...repositories import SQLiteContentRepository
from ...config import settings

router = APIRouter(prefix="/clusters", tags=["clusters"])


def _get_database_path() -> str:
    """Extract SQLite database path from connection URL."""
    url = settings.database_url
    if url.startswith("sqlite+aiosqlite:///"):
        return url.replace("sqlite+aiosqlite:///", "")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "")
    raise ValueError(f"Unsupported database URL: {url}")


class ClusterCreate(BaseModel):
    """Request model for creating a cluster."""
    subject_id: str
    topic: str
    canonical_template: str | None = None
    difficulty_baseline: int = 5


class ClusterUpdate(BaseModel):
    """Request model for updating a cluster."""
    subject_id: str | None = None
    topic: str | None = None
    canonical_template: str | None = None
    difficulty_baseline: int | None = None


@router.get("", response_model=list[QuestionCluster])
async def list_clusters(subject_id: str | None = None) -> list[QuestionCluster]:
    """Get all clusters, optionally filtered by subject."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        if subject_id:
            return await repo.get_clusters_by_subject(subject_id)
        # Get all clusters by fetching all subjects first
        subjects = await repo.get_all_subjects()
        all_clusters = []
        for subject in subjects:
            clusters = await repo.get_clusters_by_subject(subject.id)
            all_clusters.extend(clusters)
        return all_clusters
    finally:
        await repo.disconnect()


@router.get("/{cluster_id}", response_model=QuestionCluster)
async def get_cluster(cluster_id: str) -> QuestionCluster:
    """Get a cluster by ID."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        cluster = await repo.get_cluster_by_id(cluster_id)
        if not cluster:
            raise HTTPException(status_code=404, detail="Cluster not found")
        return cluster
    finally:
        await repo.disconnect()


@router.post("", response_model=QuestionCluster, status_code=201)
async def create_cluster(data: ClusterCreate) -> QuestionCluster:
    """Create a new question cluster."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        # Verify subject exists
        subject = await repo.get_subject_by_id(data.subject_id)
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")

        cluster = QuestionCluster(
            subject_id=data.subject_id,
            topic=data.topic,
            canonical_template=data.canonical_template,
            difficulty_baseline=data.difficulty_baseline,
        )
        return await repo.create_cluster(cluster)
    finally:
        await repo.disconnect()


@router.put("/{cluster_id}", response_model=QuestionCluster)
async def update_cluster(cluster_id: str, data: ClusterUpdate) -> QuestionCluster:
    """Update an existing cluster."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        cluster = await repo.get_cluster_by_id(cluster_id)
        if not cluster:
            raise HTTPException(status_code=404, detail="Cluster not found")

        if data.subject_id is not None:
            # Verify new subject exists
            subject = await repo.get_subject_by_id(data.subject_id)
            if not subject:
                raise HTTPException(status_code=404, detail="Subject not found")
            cluster.subject_id = data.subject_id
        if data.topic is not None:
            cluster.topic = data.topic
        if data.canonical_template is not None:
            cluster.canonical_template = data.canonical_template
        if data.difficulty_baseline is not None:
            cluster.difficulty_baseline = data.difficulty_baseline

        return await repo.update_cluster(cluster)
    finally:
        await repo.disconnect()


@router.delete("/{cluster_id}", status_code=204)
async def delete_cluster(cluster_id: str) -> None:
    """Delete a cluster and all its variants/answers."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        deleted = await repo.delete_cluster(cluster_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Cluster not found")
    finally:
        await repo.disconnect()
