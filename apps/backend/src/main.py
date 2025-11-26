"""MindForge API - Content Engine Backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .api.routes import health, migrations

app = FastAPI(
    title=settings.app_name,
    description="Content Engine API for the MindForge Learning Ecosystem",
    version="0.1.0",
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


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": "0.1.0",
        "status": "running",
    }
