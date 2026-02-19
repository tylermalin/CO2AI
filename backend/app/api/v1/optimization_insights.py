"""Optimization insights API - structured suggestions for reducing carbon emissions."""

import uuid

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db_readonly
from app.services.optimization_insights import generate_insights

router = APIRouter(prefix="/optimization-insights", tags=["optimization-insights"])
ORG_HEADER = "X-Organization-Id"


def _parse_org_id(header_value: str | None) -> uuid.UUID | None:
    if not header_value or not header_value.strip():
        return None
    try:
        return uuid.UUID(header_value.strip())
    except (ValueError, TypeError):
        return None


@router.get("")
async def get_optimization_insights(
    db: AsyncSession = Depends(get_db_readonly),
    days: int = 30,
    x_organization_id: str | None = Header(None, alias=ORG_HEADER),
) -> dict:
    """
    Get structured optimization suggestions based on emissions analysis.
    Analyzes token count, model size, regional carbon intensity, and budget utilization.
    """
    org_id = _parse_org_id(x_organization_id)
    insights = await generate_insights(db, organization_id=org_id, days=days)
    return {
        "insights": [
            {
                "category": i.category,
                "message": i.message,
                "estimated_reduction_percent": round(i.estimated_reduction_percent, 1),
            }
            for i in insights
        ]
    }
