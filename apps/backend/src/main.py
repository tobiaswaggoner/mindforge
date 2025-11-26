"""MindForge API - Content Engine Backend."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .api.routes import health, migrations, subjects, clusters, variants, answers, tasks
from .repositories import SQLiteTaskRepository
from .tasks import TaskRunner

# Global task runner instance
task_runner: TaskRunner | None = None


def _get_database_path() -> str:
    """Extract SQLite database path from connection URL."""
    url = settings.database_url
    if url.startswith("sqlite+aiosqlite:///"):
        return url.replace("sqlite+aiosqlite:///", "")
    if url.startswith("sqlite:///"):
        return url.replace("sqlite:///", "")
    raise ValueError(f"Unsupported database URL: {url}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown.

    Starts the task runner on startup and stops it gracefully on shutdown.
    """
    global task_runner

    # Startup
    repo = SQLiteTaskRepository(_get_database_path())
    task_runner = TaskRunner(repo)
    await task_runner.start()

    yield

    # Shutdown
    if task_runner:
        await task_runner.stop()


app = FastAPI(
    title=settings.app_name,
    description="Content Engine API for the MindForge Learning Ecosystem",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(migrations.router)
app.include_router(subjects.router)
app.include_router(clusters.router)
app.include_router(variants.router)
app.include_router(answers.router)
app.include_router(tasks.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "status": "running",
    }


def get_task_runner() -> TaskRunner | None:
    """Get the global task runner instance."""
    return task_runner
