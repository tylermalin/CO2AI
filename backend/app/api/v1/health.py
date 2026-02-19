"""Health check endpoint - DB and carbon API connectivity."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db_readonly
from app.services import get_carbon_intensity_provider

router = APIRouter()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db_readonly)) -> dict:
    """
    Liveness and readiness. Verifies DB connectivity and carbon API reachability.
    """
    result = {"status": "ok", "database": "unknown", "carbon_api": "unknown"}

    # DB check
    try:
        await db.execute(text("SELECT 1"))
        result["database"] = "connected"
    except Exception as e:
        result["database"] = "error"
        result["database_error"] = str(e)
        result["status"] = "degraded"

    # Carbon API check (Electricity Maps or default provider)
    try:
        provider = get_carbon_intensity_provider()
        zone = "US-CAL-CISO"  # Default zone for health probe
        intensity = await provider.get_carbon_intensity_g_per_kwh(zone)
        result["carbon_api"] = "connected"
        result["carbon_api_zone"] = zone
        result["carbon_intensity_sample"] = round(intensity, 2)
    except Exception as e:
        result["carbon_api"] = "error"
        result["carbon_api_error"] = str(e)
        if result["status"] == "ok":
            result["status"] = "degraded"

    return result
