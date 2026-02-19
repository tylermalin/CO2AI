"""Rate limiting placeholder - no-op middleware for future implementation."""

from starlette.requests import Request
from starlette.responses import Response


async def rate_limit_middleware(request: Request, call_next) -> Response:
    """
    Placeholder for rate limiting. Currently passes through.
    Future: check per-org/per-IP limits, return 429 when exceeded.
    """
    # TODO: Implement rate limiting (e.g. slowapi, redis-backed, or in-memory)
    return await call_next(request)
