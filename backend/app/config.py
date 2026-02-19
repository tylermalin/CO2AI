"""Environment-based configuration."""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "AI Carbon Control Plane"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://carbon:carbon@localhost:5432/carbon_control"

    # Security (override in production)
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # External APIs
    electricitymap_api_key: str | None = None
    openai_api_key: str | None = None
    openai_base_url: str = "https://api.openai.com/v1"

    # Carbon estimation (no hardcoded hardware - from env)
    hardware_efficiency_flops_per_joule: float = 1.0e11  # e.g. H100
    carbon_intensity_g_per_kwh: float = 400.0  # e.g. US average
    default_model_params: int = 70_000_000_000  # fallback for unknown models


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
