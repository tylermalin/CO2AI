"""Emissions ledger API - aggregation queries."""

import uuid

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db_readonly
from app.services.emission_ledger import daily_totals, last_n_requests, monthly_total

router = APIRouter(prefix="/emissions", tags=["emissions"])
ORG_HEADER = "X-Organization-Id"


def _parse_org_id(header_value: str | None) -> uuid.UUID | None:
    if not header_value or not header_value.strip():
        return None
    try:
        return uuid.UUID(header_value.strip())
    except (ValueError, TypeError):
        return None


@router.get("/monthly")
async def get_monthly_total(
    db: AsyncSession = Depends(get_db_readonly),
    year: int | None = None,
    month: int | None = None,
    x_organization_id: str | None = Header(None, alias=ORG_HEADER),
) -> dict:
    """Total emissions for a month. Optional year/month; defaults to current month."""
    org_id = _parse_org_id(x_organization_id)
    total = await monthly_total(db, organization_id=org_id, year=year, month=month)
    return {"total_kg_co2eq": float(total)}


@router.get("/daily")
async def get_daily_totals(
    db: AsyncSession = Depends(get_db_readonly),
    days: int = 30,
    x_organization_id: str | None = Header(None, alias=ORG_HEADER),
) -> dict:
    """Daily emission totals for the last N days."""
    org_id = _parse_org_id(x_organization_id)
    totals = await daily_totals(db, organization_id=org_id, days=days)
    return {"daily_totals": totals}


@router.get("/recent")
async def get_last_requests(
    db: AsyncSession = Depends(get_db_readonly),
    limit: int = 50,
    offset: int = 0,
    x_organization_id: str | None = Header(None, alias=ORG_HEADER),
) -> dict:
    """Paginated emission records, most recent first."""
    org_id = _parse_org_id(x_organization_id)
    limit = min(max(1, limit), 100)
    offset = max(0, offset)
    records, total = await last_n_requests(
        db, n=limit, offset=offset, organization_id=org_id
    )
    next_offset = offset + limit if offset + limit < total else None
    return {
        "records": records,
        "total_count": total,
        "limit": limit,
        "offset": offset,
        "next_offset": next_offset,
    }
