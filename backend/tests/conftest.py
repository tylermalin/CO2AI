"""Pytest fixtures."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.main import app



@pytest.fixture
def mock_db_session():
    """Mock AsyncSession for tests that don't need a real DB (e.g. proxy with mocked HTTP)."""
    session = MagicMock()
    session.add = MagicMock()
    session.flush = AsyncMock(return_value=None)
    session.refresh = AsyncMock(return_value=None)
    session.commit = AsyncMock(return_value=None)
    session.rollback = AsyncMock(return_value=None)
    session.close = AsyncMock(return_value=None)
    return session


@pytest.fixture
def app_with_mock_db(mock_db_session):
    """Override get_db to use mock session so proxy tests don't require a real DB."""
    from app.db import get_db

    async def _get_db():
        try:
            yield mock_db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_db
    yield app
    app.dependency_overrides.pop(get_db, None)
