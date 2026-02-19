"""Demo endpoint - run a test request through the proxy to populate the dashboard."""

import uuid

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.proxy.service import forward_chat_completion
from app.db import get_db

router = APIRouter(prefix="/demo", tags=["demo"])
ORG_HEADER = "X-Organization-Id"


def _parse_org_id(header_value: str | None) -> uuid.UUID | None:
    if not header_value or not header_value.strip():
        return None
    try:
        return uuid.UUID(header_value.strip())
    except (ValueError, TypeError):
        return None


@router.post("/request")
async def run_demo_request(
    db: AsyncSession = Depends(get_db),
    x_organization_id: str | None = Header(None, alias=ORG_HEADER),
) -> dict:
    """
    Run a minimal chat completion through the proxy to log an emission.
    Uses the server's OpenAI API key. Pass X-Organization-Id to attribute the emission to your org.
    """
    org_id = _parse_org_id(x_organization_id)
    body = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Say 'Hello' in one word."}],
        "max_tokens": 10,
    }
    try:
        result = await forward_chat_completion(
            body,
            stream=False,
            db=db,
            organization_id=org_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    carbon = result.get("carbon_estimate_kg_co2eq", 0)
    return {
        "ok": True,
        "carbon_kg_co2eq": carbon,
        "message": "Demo request completed. Refresh the dashboard to see your emission.",
    }
