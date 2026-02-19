"""API v1 router - aggregates all v1 routes."""

from fastapi import APIRouter

from app.api.v1 import health

router = APIRouter(prefix="/api/v1", tags=["v1"])
router.include_router(health.router, tags=["health"])
