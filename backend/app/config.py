"""Environment-based configuration."""

import json
from functools import lru_cache
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_upstream_regions(v: str | None) -> list[dict[str, str]]:
    """Parse UPSTREAM_REGIONS JSON. Returns list of {zone, base_url}."""
    if not v or not v.strip():
        return []
    try:
        data = json.loads(v)
        if not isinstance(data, list):
            return []
        return [
            {"zone": str(r.get("zone", "")), "base_url": str(r.get("base_url", "")).rstrip("/")}
            for r in data
            if r.get("zone") and r.get("base_url")
        ]
    except (json.JSONDecodeError, TypeError):
        return []


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

    # Multi-region upstream: JSON list of {"zone":"US-CAL-CISO","base_url":"https://api.openai.com/v1"}
    # Default: single region from openai_base_url + electricitymap_default_zone
    upstream_regions: str | None = None

    # Carbon estimation (no hardcoded hardware - from env)
    hardware_efficiency_flops_per_joule: float = 1.0e11  # e.g. H100
    carbon_intensity_g_per_kwh: float = 400.0  # e.g. US average (fallback)
    default_model_params: int = 70_000_000_000  # fallback for unknown models
    electricitymap_default_zone: str = "US-CAL-CISO"  # zone when not specified

    # Read-only DB URL for read replicas (optional). When set, read endpoints use it.
    database_readonly_url: str | None = None

    def get_regions(self) -> list[dict[str, str]]:
        """Parsed upstream regions. Default: single region from openai_base_url."""
        parsed = _parse_upstream_regions(self.upstream_regions)
        if parsed:
            return parsed
        return [
            {
                "zone": self.electricitymap_default_zone,
                "base_url": self.openai_base_url.rstrip("/"),
            }
        ]

    def validate_for_production(self) -> list[str]:
        """Validate config for production. Returns list of warnings/errors."""
        issues = []
        if self.jwt_secret == "change-me-in-production":
            issues.append("JWT_SECRET should be changed in production")
        if "localhost" in self.database_url or "127.0.0.1" in self.database_url:
            issues.append("DATABASE_URL appears to use localhost - use production DB in prod")
        if self.debug:
            issues.append("DEBUG should be False in production")
        return issues


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
