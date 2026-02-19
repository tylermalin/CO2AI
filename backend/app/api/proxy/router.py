"""OpenAI-compatible proxy routes."""

import uuid

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.proxy.service import forward_chat_completion
from app.db import get_db

# Headers for scoping
ORG_HEADER = "X-Organization-Id"
REGION_HEADER = "X-Region"  # Electricity Maps zone (e.g. US-CAL-CISO)
ROUTING_MODE_HEADER = "X-Routing-Mode"  # standard | optimize | latency_priority

router = APIRouter(prefix="/v1", tags=["proxy"])


def _parse_org_id(header_value: str | None) -> uuid.UUID | None:
    """Parse X-Organization-Id header to UUID. Returns None if missing/invalid."""
    if not header_value or not header_value.strip():
        return None
    try:
        return uuid.UUID(header_value.strip())
    except (ValueError, TypeError):
        return None


def _get_region(request: Request) -> str | None:
    """Region/zone for carbon intensity. None if not specified."""
    zone = request.headers.get(REGION_HEADER)
    if zone and zone.strip():
        return zone.strip()
    return None


def _get_routing_mode(request: Request) -> str:
    """Routing mode: standard, optimize, latency_priority."""
    mode = request.headers.get(ROUTING_MODE_HEADER)
    if mode and mode.strip().lower() in ("standard", "optimize", "latency_priority"):
        return mode.strip().lower()
    return "standard"


@router.post("/chat/completions")
async def chat_completions(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """OpenAI-compatible chat completions with carbon estimate and emission logging."""
    body = await request.json()
    stream = body.get("stream", False)
    org_id = _parse_org_id(request.headers.get(ORG_HEADER))
    region = _get_region(request)
    routing_mode = _get_routing_mode(request)
    result = await forward_chat_completion(
        body,
        stream=stream,
        db=db,
        organization_id=org_id,
        region=region,
        routing_mode=routing_mode,
    )
    if isinstance(result, StreamingResponse):
        return result
    return result
