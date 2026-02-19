"""Integration test stub for OpenAI proxy."""

import pytest
from unittest.mock import patch

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


@pytest.mark.anyio
async def test_proxy_returns_503_without_api_key() -> None:
    """Proxy returns 503 when OPENAI_API_KEY not configured."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/v1/chat/completions",
            json={"model": "gpt-4o-mini", "messages": [{"role": "user", "content": "Hi"}]},
        )
    assert response.status_code == 503


@respx.mock
@pytest.mark.anyio
async def test_proxy_adds_carbon_estimate() -> None:
    """Proxy forwards request, extracts usage, adds carbon_estimate_kg_co2eq."""
    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=OPENAI_MOCK_RESPONSE)
    )

    with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test"}):
        from app.config import get_settings
        get_settings.cache_clear()
        try:
            transport = httpx.ASGITransport(app=app)
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
            data = response.json()
            assert "carbon_estimate_kg_co2eq" in data
            assert isinstance(data["carbon_estimate_kg_co2eq"], (int, float))
            assert data["carbon_estimate_kg_co2eq"] >= 0
        finally:
            get_settings.cache_clear()
