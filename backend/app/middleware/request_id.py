"""Request ID middleware - generates and propagates X-Request-ID."""

import uuid
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_CTX: ContextVar[str | None] = ContextVar("request_id", default=None)
HEADER_NAME = "X-Request-ID"


def get_request_id() -> str | None:
    """Get current request ID from context."""
    return REQUEST_ID_CTX.get()


async def request_id_middleware(request: Request, call_next) -> Response:
    """Add X-Request-ID to request and response."""
    rid = request.headers.get(HEADER_NAME) or str(uuid.uuid4())
    token = REQUEST_ID_CTX.set(rid)
    try:
        response = await call_next(request)
        response.headers[HEADER_NAME] = rid
        return response
    finally:
        REQUEST_ID_CTX.reset(token)
