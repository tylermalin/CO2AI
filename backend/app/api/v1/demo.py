"""Demo endpoint - run a test request through the proxy to populate the dashboard."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.proxy.service import forward_chat_completion
from app.db import get_db

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/request")
async def run_demo_request(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Run a minimal chat completion through the proxy to log an emission.
    Uses the server's OpenAI API key. Call this to populate the dashboard with sample data.
    """
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
            organization_id=None,
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
