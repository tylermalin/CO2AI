"""Postgres connection and session management."""

from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
    AsyncEngine,
)
from app.config import get_settings
from app.db.base import Base


def get_database_url() -> str:
    """Build database URL from settings."""
    return get_settings().database_url


def get_readonly_url() -> str | None:
    """Get read-only DB URL if configured."""
    return get_settings().database_readonly_url


def _make_engine(url: str) -> AsyncEngine:
    return create_async_engine(
        url,
        echo=False,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )


engine = _make_engine(get_database_url())

# Read-only engine for read replicas (optional)
_readonly_engine: AsyncEngine | None = None


def get_readonly_engine() -> AsyncEngine | None:
    """Return read-only engine if configured."""
    global _readonly_engine
    if _readonly_engine is None:
        url = get_readonly_url()
        if url:
            _readonly_engine = _make_engine(url)
    return _readonly_engine


async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


def _get_session_maker(for_readonly: bool = False):
    """Get session maker - use readonly engine when configured and requested."""
    if for_readonly:
        ro_engine = get_readonly_engine()
        if ro_engine:
            return async_sessionmaker(
                ro_engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autocommit=False,
                autoflush=False,
            )
    return async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session (read-write)."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_readonly() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for read-only endpoints. Uses read replica if configured."""
    maker = _get_session_maker(for_readonly=True)
    async with maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database (create tables if needed). Called at startup."""
    from sqlalchemy import text

    from app import models  # noqa: F401 - register all models with Base.metadata

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Migration: add routing columns to emission_records if missing
        for col in ("routing_region", "routing_mode", "routing_reason"):
            await conn.execute(
                text(
                    f"ALTER TABLE emission_records "
                    f"ADD COLUMN IF NOT EXISTS {col} VARCHAR(255)"
                )
            )
