"""FastAPI application entry point."""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import router as v1_router
from app.api.proxy.router import router as proxy_router
from app.api.research.router import router as research_router
from app.config import get_settings
from app.db import init_db
from app.logging_config import configure_logging
from app.middleware.request_id import request_id_middleware
from app.middleware.rate_limit import rate_limit_middleware
from app.middleware.security_headers import security_headers_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: configure logging, validate config, init DB. Shutdown: cleanup."""
    configure_logging()
    log = structlog.get_logger()
    log.info("app_starting", app=app.title)

    settings = get_settings()
    issues = settings.validate_for_production()
    if issues:
        for msg in issues:
            log.warning("config_validation", message=msg)

    await init_db()
    log.info("app_ready", database="initialized")
    yield
    log.info("app_shutting_down")


def create_app() -> FastAPI:
    """Create and configure FastAPI app."""
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        lifespan=lifespan,
    )

    # Middleware (order: first added = outermost)
    app.middleware("http")(request_id_middleware)
    app.middleware("http")(rate_limit_middleware)
    app.middleware("http")(security_headers_middleware)

    # Exception handlers
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        log = structlog.get_logger()
        log.warning(
            "http_exception",
            status_code=exc.status_code,
            detail=str(exc.detail),
            path=request.url.path,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail} if isinstance(exc.detail, (str, dict)) else {"detail": str(exc.detail)},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        log = structlog.get_logger()
        log.warning("validation_error", errors=exc.errors(), path=request.url.path)
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        log = structlog.get_logger()
        log.exception("unhandled_exception", path=request.url.path, error=str(exc))
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    app.include_router(v1_router)
    app.include_router(proxy_router)
    app.include_router(research_router)
    return app


app = create_app()
