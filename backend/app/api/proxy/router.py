"""OpenAI-compatible proxy routes."""

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.api.proxy.service import forward_chat_completion

router = APIRouter(prefix="/v1", tags=["proxy"])


@router.post("/chat/completions")
async def chat_completions(request: Request):
    """OpenAI-compatible chat completions with carbon estimate."""
    body = await request.json()
    stream = body.get("stream", False)
    result = await forward_chat_completion(body, stream=stream)
    if isinstance(result, StreamingResponse):
        return result
    return result
