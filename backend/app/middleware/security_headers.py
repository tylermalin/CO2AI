"""Security headers middleware."""

from starlette.requests import Request
from starlette.responses import Response

HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}


async def security_headers_middleware(request: Request, call_next) -> Response:
    """Add basic security headers to all responses."""
    response = await call_next(request)
    for name, value in HEADERS.items():
        response.headers.setdefault(name, value)
    return response
