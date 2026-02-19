"""Postgres connection and session management."""

from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.config import get_settings
from app.db.base import Base


def get_database_url() -> str:
    """Build database URL from settings."""
    return get_settings().database_url


engine = create_async_engine(
    get_database_url(),
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
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
