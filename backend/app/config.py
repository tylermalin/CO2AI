"""Environment-based configuration."""

import json
from functools import lru_cache
from typing import Any
from urllib.parse import quote, unquote

from pydantic_settings import BaseSettings, SettingsConfigDict


def _encode_postgres_url_password(url: str) -> str:
    """
    URL-encode the password in a postgres URL. Railway passwords often contain
    @, #, :, / which break URL parsing. Split on last @ (credentials@host).
    """
    for prefix in ("postgresql://", "postgresql+asyncpg://", "postgres://"):
        if url.startswith(prefix):
            rest = url[len(prefix) :]
            if "@" not in rest:
                return url
            # Last @ separates user:password from host:port/db
            last_at = rest.rfind("@")
            creds, host = rest[:last_at], rest[last_at + 1 :]
            if ":" in creds:
                user, _, password = creds.partition(":")
                if password != unquote(password):
                    return url  # Already encoded
                password_encoded = quote(password, safe="")
                creds = f"{user}:{password_encoded}"
            return f"{prefix}{creds}@{host}"
    return url


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


def _normalize_database_url(url: str) -> str:
    """Ensure DATABASE_URL uses postgresql+asyncpg for SQLAlchemy async."""
    if not url or not url.strip():
        raise ValueError(
            "DATABASE_URL is empty. On Railway: Variables → Add Reference → "
            "select your Postgres service → choose DATABASE_URL or DATABASE_PUBLIC_URL"
        )
    url = url.strip()
    # Reject unresolved Railway variable references
    if url.startswith("${{") or "{{" in url:
        raise ValueError(
            "DATABASE_URL looks like an unresolved reference. "
            "Ensure the Postgres service is linked: Variables → Add Reference → Postgres → DATABASE_URL"
        )
    if url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://") :]
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = "postgresql+asyncpg://" + url[len("postgresql://") :]
    elif not url.startswith("postgresql"):
        raise ValueError(
            f"DATABASE_URL must start with postgres:// or postgresql://, got: {url[:50]}..."
        )
    # Encode password - Railway passwords with @, #, :, / break SQLAlchemy parsing
    return _encode_postgres_url_password(url)


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

    # Database (Railway Postgres exposes DATABASE_URL or DATABASE_PUBLIC_URL)
    database_url: str = "postgresql+asyncpg://carbon:carbon@localhost:5432/carbon_control"
    database_public_url: str | None = None  # Railway fallback

    @property
    def database_url_normalized(self) -> str:
        url = self.database_url
        # Use DATABASE_PUBLIC_URL if DATABASE_URL is localhost (Railway fallback)
        if self.database_public_url and ("localhost" in url or "127.0.0.1" in url):
            url = self.database_public_url
        return _normalize_database_url(url)

    # Security (override in production)
    jwt_secret: str = "change-me-in-production"
    magic_secret_key: str | None = None  # Magic Labs secret key (sk_live_...) for DID token verification
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

    # CORS: comma-separated origins, or "*" for all. Set in production to your frontend URL(s).
    cors_origins: str = "*"

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
