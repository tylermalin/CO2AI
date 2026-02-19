"""Tests for Electricity Maps carbon intensity integration."""

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
async def test_mockable_provider_uses_injected_intensity(app_with_mock_db) -> None:
    """Proxy uses injectable carbon intensity provider - mock returns 100 g/kWh."""
    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    mock_provider = AsyncMock()
    mock_provider.get_carbon_intensity_g_per_kwh.return_value = 100.0

    with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test"}):
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
                    )
            assert response.status_code == 200
            mock_provider.get_carbon_intensity_g_per_kwh.assert_called_once()
            data = response.json()
            assert "carbon_estimate_kg_co2eq" in data
            assert data["carbon_estimate_kg_co2eq"] >= 0
        finally:
            get_settings.cache_clear()


@respx.mock
@pytest.mark.anyio
async def test_fallback_to_default_when_no_api_key(app_with_mock_db) -> None:
    """When ELECTRICITYMAP_API_KEY not set, uses default intensity (no API call)."""
    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test", "ELECTRICITYMAP_API_KEY": ""}):
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
                )
            assert response.status_code == 200
            # No Electricity Maps API call
            assert len(respx.calls) == 1  # only OpenAI
            data = response.json()
            assert "carbon_estimate_kg_co2eq" in data
        finally:
            get_settings.cache_clear()


@pytest.mark.anyio
async def test_electricity_maps_real_api() -> None:
    """Integration test: call real Electricity Maps API with key from env."""
    import os
    from app.services.electricity_maps_provider import ElectricityMapsProvider

    api_key = os.environ.get("ELECTRICITYMAP_API_KEY")
    if not api_key:
        pytest.skip("ELECTRICITYMAP_API_KEY not set - skip real API test")

    provider = ElectricityMapsProvider(api_key=api_key, default_intensity=400.0)
    intensity = await provider.get_carbon_intensity_g_per_kwh("US-CAL-CISO")
    assert isinstance(intensity, (int, float))
    assert intensity >= 0
    assert intensity < 1000  # sanity: g/kWh typically 0-800
