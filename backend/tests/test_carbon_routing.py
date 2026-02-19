"""Tests for carbon-aware routing engine."""

import json
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
        "prompt_tokens": 10,
        "completion_tokens": 5,
        "total_tokens": 15,
    },
}


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
def mock_db_session():
    session = type("MockSession", (), {})()
    session.add = lambda x: None
    session.flush = AsyncMock(return_value=None)
    session.refresh = AsyncMock(return_value=None)
    session.commit = AsyncMock(return_value=None)
    session.rollback = AsyncMock(return_value=None)
    session.execute = AsyncMock(
        return_value=type("Result", (), {"scalar_one_or_none": lambda: None})()
    )
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
async def test_standard_mode_uses_explicit_region(app_with_mock_db) -> None:
    """Standard mode with X-Region uses that region."""
    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    regions_json = json.dumps([
        {"zone": "US-CAL-CISO", "base_url": "https://api.openai.com/v1"},
        {"zone": "US-NY-NYIS", "base_url": "https://api.openai.com/v1"},
    ])

    with patch.dict(
        "os.environ",
        {"OPENAI_API_KEY": "sk-test", "UPSTREAM_REGIONS": regions_json},
    ):
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
                    headers={"X-Region": "US-NY-NYIS"},
                )
            assert response.status_code == 200
            data = response.json()
            assert data["routing"]["region"] == "US-NY-NYIS"
            assert data["routing"]["mode"] == "standard"
        finally:
            get_settings.cache_clear()


@respx.mock
@pytest.mark.anyio
async def test_optimize_mode_selects_lowest_carbon(app_with_mock_db) -> None:
    """Optimize mode selects region with lowest carbon intensity."""
    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    regions_json = json.dumps([
        {"zone": "US-CAL-CISO", "base_url": "https://api.openai.com/v1"},
        {"zone": "US-NY-NYIS", "base_url": "https://api.openai.com/v1"},
        {"zone": "FR", "base_url": "https://api.openai.com/v1"},
    ])

    mock_provider = AsyncMock()
    # Simulate: FR low, US-NY medium, US-CAL high
    def mock_intensity(zone):
        if zone == "FR":
            return 50.0
        if zone == "US-NY-NYIS":
            return 250.0
        return 400.0  # US-CAL-CISO
    mock_provider.get_carbon_intensity_g_per_kwh.side_effect = mock_intensity

    with patch.dict(
        "os.environ",
        {"OPENAI_API_KEY": "sk-test", "UPSTREAM_REGIONS": regions_json},
    ):
        from app.config import get_settings
        get_settings.cache_clear()
        try:
            with patch(
                "app.api.proxy.service.get_carbon_intensity_provider",
                return_value=mock_provider,
            ):
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
                        headers={"X-Routing-Mode": "optimize"},
                    )
            assert response.status_code == 200
            data = response.json()
            assert data["routing"]["region"] == "FR"
            assert data["routing"]["mode"] == "optimize"
            assert "region_estimates" in data["routing"]
            assert len(data["routing"]["region_estimates"]) == 3
        finally:
            get_settings.cache_clear()


@respx.mock
@pytest.mark.anyio
async def test_latency_priority_uses_first_region(app_with_mock_db) -> None:
    """Latency priority uses first region without carbon API call."""
    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    regions_json = json.dumps([
        {"zone": "US-CAL-CISO", "base_url": "https://api.openai.com/v1"},
        {"zone": "FR", "base_url": "https://api.openai.com/v1"},
    ])

    mock_provider = AsyncMock()
    mock_provider.get_carbon_intensity_g_per_kwh.return_value = 100.0

    with patch.dict(
        "os.environ",
        {"OPENAI_API_KEY": "sk-test", "UPSTREAM_REGIONS": regions_json},
    ):
        from app.config import get_settings
        get_settings.cache_clear()
        try:
            with patch(
                "app.api.proxy.service.get_carbon_intensity_provider",
                return_value=mock_provider,
            ):
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
                        headers={"X-Routing-Mode": "latency_priority"},
                    )
            assert response.status_code == 200
            data = response.json()
            assert data["routing"]["region"] == "US-CAL-CISO"
            assert data["routing"]["mode"] == "latency_priority"
            # Routing skips multi-region lookup; provider called only once for final estimate
            assert mock_provider.get_carbon_intensity_g_per_kwh.call_count == 1
        finally:
            get_settings.cache_clear()


@respx.mock
@pytest.mark.anyio
async def test_carbon_api_failure_does_not_block(app_with_mock_db) -> None:
    """When carbon API fails in optimize mode, fallback to first region (no block)."""
    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    regions_json = json.dumps([
        {"zone": "US-CAL-CISO", "base_url": "https://api.openai.com/v1"},
        {"zone": "FR", "base_url": "https://api.openai.com/v1"},
    ])

    mock_provider = AsyncMock()
    mock_provider.get_carbon_intensity_g_per_kwh.side_effect = Exception("API down")

    with patch.dict(
        "os.environ",
        {"OPENAI_API_KEY": "sk-test", "UPSTREAM_REGIONS": regions_json},
    ):
        from app.config import get_settings
        get_settings.cache_clear()
        try:
            with patch(
                "app.api.proxy.service.get_carbon_intensity_provider",
                return_value=mock_provider,
            ):
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
                        headers={"X-Routing-Mode": "optimize"},
                    )
            assert response.status_code == 200
            data = response.json()
            assert "routing" in data
            assert data["routing"]["region"] in ("US-CAL-CISO", "FR")
            assert "carbon_estimate_kg_co2eq" in data
        finally:
            get_settings.cache_clear()
