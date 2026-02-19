"""OpenAI proxy service - forward requests, estimate carbon, log emissions."""

import uuid

import httpx
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.estimation import estimate_carbon
from app.api.proxy.models import get_active_params
from app.services.carbon_budget import check_budget
from app.services.emission_ledger import log_emission
from app.services import get_carbon_intensity_provider


async def forward_chat_completion(
    body: dict,
    stream: bool = False,
    db: AsyncSession | None = None,
    organization_id: uuid.UUID | None = None,
    region: str | None = None,
    routing_mode: str = "standard",
    carbon_intensity_provider=None,
    include_insights: bool = False,
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

    provider = carbon_intensity_provider or get_carbon_intensity_provider()
    from app.services.carbon_router import select_region

    decision = await select_region(
        body=body,
        mode=routing_mode,
        explicit_region=region,
        carbon_intensity_provider=provider,
    )

    url = f"{decision.base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=body, headers=headers)

    if response.status_code >= 400:
        _raise_upstream_error(response)

    data = response.json()
    carbon_estimate = await _compute_carbon(
        data, body.get("model"), provider, decision.zone
    )
    data["carbon_estimate_kg_co2eq"] = round(carbon_estimate, 10)

    # Routing metadata
    data["routing"] = {
        "region": decision.zone,
        "mode": decision.mode,
        "reason": decision.reason,
    }
    if decision.region_estimates:
        data["routing"]["region_estimates"] = decision.region_estimates

    # Budget check before commit (org-level)
    if db is not None and organization_id is not None:
        budget_result = await check_budget(db, organization_id, carbon_estimate)
        if budget_result is not None and not budget_result.allowed:
            raise HTTPException(
                status_code=402,
                detail={
                    "code": "carbon_budget_exceeded",
                    "message": "Monthly carbon budget exceeded",
                    "current_kg_co2eq": budget_result.current_kg,
                    "projected_kg_co2eq": budget_result.projected_kg,
                    "limit_kg_co2eq": budget_result.limit_kg,
                },
            )
        if budget_result is not None and budget_result.warning:
            data["carbon_budget_warning"] = budget_result.warning

    # Persist emission record for ledger (with routing decision)
    if db is not None:
        usage = data.get("usage") or {}
        await log_emission(
            db,
            organization_id=organization_id,
            model=body.get("model") or "unknown",
            input_tokens=usage.get("prompt_tokens", 0),
            output_tokens=usage.get("completion_tokens", 0),
            carbon_kg_co2eq=carbon_estimate,
            routing_region=decision.zone,
            routing_mode=decision.mode,
            routing_reason=decision.reason,
        )

    # Optionally add optimization insights to response
    if include_insights and db is not None:
        from app.services.optimization_insights import generate_insights
        insights = await generate_insights(db, organization_id=organization_id, days=30)
        data["carbon_insights"] = [
            {
                "category": i.category,
                "message": i.message,
                "estimated_reduction_percent": round(i.estimated_reduction_percent, 1),
            }
            for i in insights[:3]  # Top 3 insights
        ]

    return data


def _raise_upstream_error(response: httpx.Response) -> None:
    """Raise HTTPException from upstream response."""
    raise HTTPException(
        status_code=response.status_code,
        detail=response.text or f"Upstream error: {response.status_code}",
    )


async def _compute_carbon(
    response_data: dict,
    model: str | None,
    carbon_intensity_provider,
    zone: str,
) -> float:
    """Extract usage from response, run estimator with injectable carbon intensity."""
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
    try:
        carbon_intensity = await carbon_intensity_provider.get_carbon_intensity_g_per_kwh(zone)
    except Exception:
        carbon_intensity = settings.carbon_intensity_g_per_kwh
    return estimate_carbon(
        active_params=active_params,
        token_count=total_tokens,
        hardware_efficiency=settings.hardware_efficiency_flops_per_joule,
        carbon_intensity_g_per_kwh=carbon_intensity,
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
