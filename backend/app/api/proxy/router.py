"""OpenAI-compatible proxy routes."""

import uuid

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.proxy.service import forward_chat_completion
from app.db import get_db

# Header for organization scoping (optional)
ORG_HEADER = "X-Organization-Id"

router = APIRouter(prefix="/v1", tags=["proxy"])


def _parse_org_id(header_value: str | None) -> uuid.UUID | None:
    """Parse X-Organization-Id header to UUID. Returns None if missing/invalid."""
    if not header_value or not header_value.strip():
        return None
    try:
        return uuid.UUID(header_value.strip())
    except (ValueError, TypeError):
        return None


@router.post("/chat/completions")
async def chat_completions(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """OpenAI-compatible chat completions with carbon estimate and emission logging."""
    body = await request.json()
    stream = body.get("stream", False)
    org_id = _parse_org_id(request.headers.get(ORG_HEADER))
    result = await forward_chat_completion(body, stream=stream, db=db, organization_id=org_id)
    if isinstance(result, StreamingResponse):
        return result
    return result
