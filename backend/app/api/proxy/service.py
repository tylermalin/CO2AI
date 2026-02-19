"""OpenAI proxy service - forward requests, estimate carbon, log emissions."""

import uuid

import httpx
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.estimation import estimate_carbon
from app.api.proxy.models import get_active_params
from app.services.emission_ledger import log_emission


async def forward_chat_completion(
    body: dict,
    stream: bool = False,
    db: AsyncSession | None = None,
    organization_id: uuid.UUID | None = None,
) -> dict | StreamingResponse:
    """Forward to OpenAI, extract usage, add carbon_estimate. Async."""
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key not configured",
        )

    if stream:
        return await _stream_placeholder(body)

    url = f"{settings.openai_base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=body, headers=headers)

    if response.status_code >= 400:
        _raise_upstream_error(response)

    data = response.json()
    carbon_estimate = _compute_carbon(data, body.get("model"))
    data["carbon_estimate_kg_co2eq"] = round(carbon_estimate, 10)

    # Persist emission record for ledger
    if db is not None:
        usage = data.get("usage") or {}
        await log_emission(
            db,
            organization_id=organization_id,
            model=body.get("model") or "unknown",
            input_tokens=usage.get("prompt_tokens", 0),
            output_tokens=usage.get("completion_tokens", 0),
            carbon_kg_co2eq=carbon_estimate,
        )

    return data


def _raise_upstream_error(response: httpx.Response) -> None:
    """Raise HTTPException from upstream response."""
    raise HTTPException(
        status_code=response.status_code,
        detail=response.text or f"Upstream error: {response.status_code}",
    )


def _compute_carbon(response_data: dict, model: str | None) -> float:
    """Extract usage from response, run estimator, return kg CO2eq."""
    usage = response_data.get("usage")
    if not usage:
        return 0.0

    prompt_tokens = usage.get("prompt_tokens", 0)
    completion_tokens = usage.get("completion_tokens", 0)
    total_tokens = prompt_tokens + completion_tokens
    if total_tokens == 0:
        return 0.0

    settings = get_settings()
    active_params = get_active_params(
        model or "gpt-4",
        settings.default_model_params,
    )
    return estimate_carbon(
        active_params=active_params,
        token_count=total_tokens,
        hardware_efficiency=settings.hardware_efficiency_flops_per_joule,
        carbon_intensity_g_per_kwh=settings.carbon_intensity_g_per_kwh,
    )


async def _stream_placeholder(body: dict) -> StreamingResponse:
    """Streaming placeholder - forwards SSE stream. Carbon not yet added to stream."""
    settings = get_settings()
    url = f"{settings.openai_base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    async def chunk_generator() -> bytes:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", url, json=body, headers=headers) as resp:
                if resp.status_code >= 400:
                    body_text = await resp.aread()
                    raise HTTPException(
                        status_code=resp.status_code,
                        detail=body_text.decode() if body_text else f"Upstream error: {resp.status_code}",
                    )
                async for chunk in resp.aiter_bytes():
                    yield chunk

    return StreamingResponse(
        chunk_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
