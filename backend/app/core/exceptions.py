"""HTTP exception handlers."""

from fastapi import Request
from fastapi.responses import JSONResponse


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler."""
    return JSONResponse(
        status_code=getattr(exc, "status_code", 500),
        content={"detail": str(exc)},
    )
