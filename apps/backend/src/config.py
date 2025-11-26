"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "MindForge API"
    debug: bool = False

    # Server
    port: int = 4202

    # Database
    database_url: str = "sqlite+aiosqlite:///./mindforge.db"

    # CORS
    cors_origins: list[str] = ["http://localhost:4201"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
