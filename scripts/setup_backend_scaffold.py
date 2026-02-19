#!/usr/bin/env python3
"""
AIC02 Phase 1 — Backend scaffold setup script.
Run after freeing disk space to complete the backend skeleton.

Usage:
    python scripts/setup_backend_scaffold.py
    # or from project root:
    cd AIC02 && python scripts/setup_backend_scaffold.py
"""

from pathlib import Path

# Project root (AIC02)
ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
APP = BACKEND / "app"


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}")


def main() -> None:
    print("AIC02 Phase 1 — Backend scaffold setup")
    print("=" * 50)

    # --- Services ---
    write(APP / "services" / "__init__.py", '''"""Service layer - modular, registry-loaded."""

from app.services.registry import get_service, ServiceRegistry

__all__ = ["get_service", "ServiceRegistry"]
''')

    write(APP / "services" / "base.py", '''"""Base service class for dependency injection."""

from abc import ABC
from typing import Any


class BaseService(ABC):
    """Abstract base for injectable services."""

    def __init__(self, **kwargs: Any) -> None:
        """Initialize with optional dependencies."""
        for key, value in kwargs.items():
            setattr(self, key, value)
''')

    write(APP / "services" / "registry.py", '''"""Registry loader for service dependency injection."""

from typing import Any, TypeVar

T = TypeVar("T")


class ServiceRegistry:
    """Registry for lazy-loaded services. Enables clean dependency injection."""

    _instances: dict[str, Any] = {}
    _factories: dict[str, tuple[type, dict[str, Any]]] = {}

    @classmethod
    def register(
        cls,
        name: str,
        service_class: type,
        **deps: Any,
    ) -> None:
        """Register a service class with optional dependencies."""
        cls._factories[name] = (service_class, deps)

    @classmethod
    def get(cls, name: str) -> Any:
        """Get or create a service instance."""
        if name not in cls._instances:
            if name not in cls._factories:
                raise KeyError(f"Service not registered: {name}")
            service_class, deps = cls._factories[name]
            cls._instances[name] = service_class(**deps)
        return cls._instances[name]

    @classmethod
    def clear(cls) -> None:
        """Clear all instances (for testing)."""
        cls._instances.clear()


def get_service(name: str) -> Any:
    """Dependency that resolves a service from the registry."""
    return ServiceRegistry.get(name)
''')

    for name in [
        "carbon_intensity",
        "carbon_calculator",
        "budget_enforcer",
        "carbon_router",
        "llm_proxy",
        "request_logger",
    ]:
        cls = "".join(w.capitalize() for w in name.split("_")) + "Service"
        write(
            APP / "services" / f"{name}.py",
            f'''"""{" ".join(name.split("_")).title()} service. Stub for Phase 1."""

from app.services.base import BaseService


class {cls}(BaseService):
    """Placeholder - implement in later phase."""

    pass
''',
        )

    # --- Core ---
    write(APP / "core" / "__init__.py", '"""Core utilities."""\n')
    write(APP / "core" / "security.py", '''"""Security - JWT, API keys. Stub for Phase 1."""

# Placeholder - implement in later phase
''')
    write(APP / "core" / "exceptions.py", '''"""HTTP exception handlers."""

from fastapi import Request
from fastapi.responses import JSONResponse


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler."""
    return JSONResponse(
        status_code=getattr(exc, "status_code", 500),
        content={"detail": str(exc)},
    )
''')

    # --- API ---
    write(APP / "api" / "__init__.py", '"""API routes."""\n')
    write(APP / "api" / "v1" / "__init__.py", '"""API v1."""\n')
    write(APP / "api" / "v1" / "router.py", '''"""API v1 router - aggregates all v1 routes."""

from fastapi import APIRouter

from app.api.v1 import health

router = APIRouter(prefix="/api/v1", tags=["v1"])
router.include_router(health.router, tags=["health"])
''')
    write(APP / "api" / "v1" / "health.py", '''"""Health check endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db

router = APIRouter()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """Liveness and readiness - verifies DB connectivity."""
    await db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
''')
    write(APP / "api" / "v1" / "auth.py", '''"""Auth endpoints. Stub for Phase 1."""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])
# Placeholder - implement in later phase
''')
    write(APP / "api" / "v1" / "budgets.py", '''"""Budget CRUD. Stub for Phase 1."""

from fastapi import APIRouter

router = APIRouter(prefix="/budgets", tags=["budgets"])
# Placeholder - implement in later phase
''')
    write(APP / "api" / "v1" / "metrics.py", '''"""Carbon metrics. Stub for Phase 1."""

from fastapi import APIRouter

router = APIRouter(prefix="/metrics", tags=["metrics"])
# Placeholder - implement in later phase
''')
    write(APP / "api" / "proxy" / "__init__.py", '"""OpenAI-compatible proxy routes."""\n')
    write(APP / "api" / "proxy" / "router.py", '''"""OpenAI-compatible proxy. Stub for Phase 1."""

from fastapi import APIRouter

router = APIRouter(prefix="/v1", tags=["proxy"])
# Placeholder - implement in later phase
''')

    # --- Schemas ---
    write(APP / "schemas" / "__init__.py", '"""Pydantic schemas."""\n')

    # --- Main ---
    write(APP / "main.py", '''"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.router import router as v1_router
from app.api.proxy.router import router as proxy_router
from app.config import get_settings
from app.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB. Shutdown: cleanup."""
    await init_db()
    yield
    # Shutdown cleanup if needed


def create_app() -> FastAPI:
    """Create and configure FastAPI app."""
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        lifespan=lifespan,
    )
    app.include_router(v1_router)
    app.include_router(proxy_router)
    return app


app = create_app()
''')

    # --- DB migrations placeholder ---
    (APP / "db" / "migrations").mkdir(parents=True, exist_ok=True)
    write(APP / "db" / "migrations" / ".gitkeep", "")

    # --- Tests ---
    write(BACKEND / "tests" / "__init__.py", "")
    write(BACKEND / "tests" / "conftest.py", '''"""Pytest fixtures. Placeholder for Phase 1."""
''')

    # --- Docker ---
    write(BACKEND / "Dockerfile", '''FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
ENV PYTHONPATH=/app
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
''')

    write(ROOT / "docker-compose.yml", '''services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql+asyncpg://carbon:${DB_PASSWORD:-carbon}@db:5432/carbon_control

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: carbon
      POSTGRES_PASSWORD: ${DB_PASSWORD:-carbon}
      POSTGRES_DB: carbon_control
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U carbon -d carbon_control"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
''')

    write(ROOT / ".env.example", '''# Database
DB_PASSWORD=carbon
DATABASE_URL=postgresql+asyncpg://carbon:carbon@localhost:5432/carbon_control

# Security (override in production)
JWT_SECRET=change-me-in-production

# External APIs (optional for scaffold)
ELECTRICITYMAP_API_KEY=
OPENAI_API_KEY=
''')

    write(ROOT / "README.md", '''# AIC02 — AI Carbon Control Plane

Phase 1 backend scaffold. FastAPI + Postgres + Docker.

## Setup

1. Copy `.env.example` to `.env` and adjust.
2. Run with Docker Compose:

```bash
docker compose up --build
```

Backend: http://localhost:8000  
Health: http://localhost:8000/api/v1/health
''')

    print()
    print("Done. Run: docker compose up --build")
    print("Then: curl http://localhost:8000/api/v1/health")


if __name__ == "__main__":
    main()
