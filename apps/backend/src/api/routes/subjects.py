"""Subject CRUD endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...models import Subject
from ...repositories import SQLiteContentRepository
from ...config import settings

router = APIRouter(prefix="/subjects", tags=["subjects"])


def _get_database_path() -> str:
    """Extract SQLite database path from connection URL."""
    url = settings.database_url
    if url.startswith("sqlite+aiosqlite:///"):
        return url.replace("sqlite+aiosqlite:///", "")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "")
    raise ValueError(f"Unsupported database URL: {url}")


class SubjectCreate(BaseModel):
    """Request model for creating a subject."""
    key: str
    name: str


class SubjectUpdate(BaseModel):
    """Request model for updating a subject."""
    key: str | None = None
    name: str | None = None


@router.get("", response_model=list[Subject])
async def list_subjects() -> list[Subject]:
    """Get all subjects."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        return await repo.get_all_subjects()
    finally:
        await repo.disconnect()


@router.get("/{subject_id}", response_model=Subject)
async def get_subject(subject_id: str) -> Subject:
    """Get a subject by ID."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        subject = await repo.get_subject_by_id(subject_id)
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        return subject
    finally:
        await repo.disconnect()


@router.post("", response_model=Subject, status_code=201)
async def create_subject(data: SubjectCreate) -> Subject:
    """Create a new subject."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        # Check if key already exists
        existing = await repo.get_subject_by_key(data.key)
        if existing:
            raise HTTPException(status_code=409, detail=f"Subject with key '{data.key}' already exists")
        subject = Subject(key=data.key, name=data.name)
        return await repo.create_subject(subject)
    finally:
        await repo.disconnect()


@router.put("/{subject_id}", response_model=Subject)
async def update_subject(subject_id: str, data: SubjectUpdate) -> Subject:
    """Update an existing subject."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        subject = await repo.get_subject_by_id(subject_id)
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")

        if data.key is not None:
            subject.key = data.key
        if data.name is not None:
            subject.name = data.name

        return await repo.update_subject(subject)
    finally:
        await repo.disconnect()


@router.delete("/{subject_id}", status_code=204)
async def delete_subject(subject_id: str) -> None:
    """Delete a subject."""
    repo = SQLiteContentRepository(_get_database_path())
    try:
        await repo.connect()
        deleted = await repo.delete_subject(subject_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Subject not found")
    finally:
        await repo.disconnect()
