"""Tests for carbon budget enforcement in proxy."""

import uuid
from unittest.mock import AsyncMock, patch

import pytest
import httpx
import respx

from app.main import app

OPENAI_MOCK_RESPONSE = {
    "id": "chatcmpl-123",
    "object": "chat.completion",
    "choices": [{"message": {"role": "assistant", "content": "Hello"}}],
    "usage": {
        "prompt_tokens": 100,
        "completion_tokens": 50,
        "total_tokens": 150,
    },
}


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
def mock_db_session():
    """Mock AsyncSession for proxy tests."""
    session = type("MockSession", (), {})()
    session.add = lambda x: None
    session.flush = AsyncMock(return_value=None)
    session.refresh = AsyncMock(return_value=None)
    session.commit = AsyncMock(return_value=None)
    session.rollback = AsyncMock(return_value=None)
    session.close = AsyncMock(return_value=None)
    session.execute = AsyncMock(return_value=type("Result", (), {"scalar_one_or_none": lambda: None})())
    return session


@pytest.fixture
def app_with_mock_db(mock_db_session):
    from app.db import get_db

    async def _get_db():
        try:
            yield mock_db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_db
    yield app
    app.dependency_overrides.pop(get_db, None)


@respx.mock
@pytest.mark.anyio
async def test_no_budget_allows_request(app_with_mock_db) -> None:
    """When org has no budget, request proceeds without 402 or warning."""
    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    with patch("app.api.proxy.service.check_budget", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = None  # No budget configured

        with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test"}):
            from app.config import get_settings
            get_settings.cache_clear()
            try:
                transport = httpx.ASGITransport(app=app_with_mock_db)
                async with httpx.AsyncClient(
                    transport=transport, base_url="http://test"
                ) as client:
                    response = await client.post(
                        "/v1/chat/completions",
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [{"role": "user", "content": "Hi"}],
                        },
                        headers={"X-Organization-Id": str(uuid.uuid4())},
                    )
                assert response.status_code == 200
                data = response.json()
                assert "carbon_budget_warning" not in data
            finally:
                get_settings.cache_clear()


@respx.mock
@pytest.mark.anyio
async def test_soft_warning_attached_when_threshold_exceeded(app_with_mock_db) -> None:
    """When projected exceeds alert threshold but not limit, attach warning metadata."""
    from app.services.carbon_budget import BudgetCheckResult

    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    with patch("app.api.proxy.service.check_budget", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = BudgetCheckResult(
            allowed=True,
            warning="Carbon budget alert: projected 0.5 kg CO2eq (90% of 0.55 kg limit)",
            current_kg=0.4,
            projected_kg=0.5,
            limit_kg=0.55,
            threshold_pct=80.0,
        )

        with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test"}):
            from app.config import get_settings
            get_settings.cache_clear()
            try:
                transport = httpx.ASGITransport(app=app_with_mock_db)
                async with httpx.AsyncClient(
                    transport=transport, base_url="http://test"
                ) as client:
                    response = await client.post(
                        "/v1/chat/completions",
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [{"role": "user", "content": "Hi"}],
                        },
                        headers={"X-Organization-Id": str(uuid.uuid4())},
                    )
                assert response.status_code == 200
                data = response.json()
                assert "carbon_budget_warning" in data
                assert "90%" in data["carbon_budget_warning"]
            finally:
                get_settings.cache_clear()


@respx.mock
@pytest.mark.anyio
async def test_hard_block_returns_402(app_with_mock_db) -> None:
    """When projected exceeds limit and hard_block=True, return 402."""
    from app.services.carbon_budget import BudgetCheckResult

    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    with patch("app.api.proxy.service.check_budget", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = BudgetCheckResult(
            allowed=False,
            warning=None,
            current_kg=0.4,
            projected_kg=0.6,
            limit_kg=0.5,
            threshold_pct=80.0,
        )

        with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test"}):
            from app.config import get_settings
            get_settings.cache_clear()
            try:
                transport = httpx.ASGITransport(app=app_with_mock_db)
                async with httpx.AsyncClient(
                    transport=transport, base_url="http://test"
                ) as client:
                    response = await client.post(
                        "/v1/chat/completions",
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [{"role": "user", "content": "Hi"}],
                        },
                        headers={"X-Organization-Id": str(uuid.uuid4())},
                    )
                assert response.status_code == 402
                data = response.json()
                assert "detail" in data
                assert data["detail"]["code"] == "carbon_budget_exceeded"
                assert data["detail"]["limit_kg_co2eq"] == 0.5
            finally:
                get_settings.cache_clear()
