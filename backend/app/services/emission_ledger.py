"""Emissions ledger - persistence and aggregation queries."""

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.emission_record import EmissionRecord


async def log_emission(
    db: AsyncSession,
    *,
    organization_id: uuid.UUID | None,
    model: str,
    input_tokens: int,
    output_tokens: int,
    carbon_kg_co2eq: float,
) -> EmissionRecord:
    """Persist a single emission record."""
    record = EmissionRecord(
        organization_id=organization_id,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        carbon_kg_co2eq=Decimal(str(carbon_kg_co2eq)),
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


async def monthly_total(
    db: AsyncSession,
    organization_id: uuid.UUID | None = None,
    year: int | None = None,
    month: int | None = None,
) -> Decimal:
    """Total emissions for a month. If org None, all orgs. If year/month None, current month."""
    now = datetime.now(timezone.utc)
    y = year or now.year
    m = month or now.month
    tz = timezone.utc
    start = datetime(y, m, 1, tzinfo=tz)
    if m == 12:
        end = datetime(y + 1, 1, 1, tzinfo=tz)
    else:
        end = datetime(y, m + 1, 1, tzinfo=tz)

    q = select(func.coalesce(func.sum(EmissionRecord.carbon_kg_co2eq), 0)).where(
        EmissionRecord.created_at >= start,
        EmissionRecord.created_at < end,
    )
    if organization_id is not None:
        q = q.where(EmissionRecord.organization_id == organization_id)
    result = await db.execute(q)
    return result.scalar_one()


async def daily_totals(
    db: AsyncSession,
    organization_id: uuid.UUID | None = None,
    days: int = 30,
) -> list[dict]:
    """Daily emission totals for the last N days. Returns list of {date, total_kg_co2eq}."""
    now = datetime.now(timezone.utc)
    cutoff = now.replace(hour=0, minute=0, second=0, microsecond=0)
    cutoff = cutoff - timedelta(days=days)

    date_col = func.date(EmissionRecord.created_at)
    q = (
        select(
            date_col.label("date"),
            func.sum(EmissionRecord.carbon_kg_co2eq).label("total_kg_co2eq"),
        )
        .where(EmissionRecord.created_at >= cutoff)
        .group_by(date_col)
        .order_by(date_col)
    )
    if organization_id is not None:
        q = q.where(EmissionRecord.organization_id == organization_id)
    result = await db.execute(q)
    rows = result.all()
    return [
        {"date": str(row.date), "total_kg_co2eq": float(row.total_kg_co2eq)}
        for row in rows
    ]


async def last_n_requests(
    db: AsyncSession,
    n: int = 100,
    organization_id: uuid.UUID | None = None,
) -> list[dict]:
    """Last N emission records, most recent first."""
    q = (
        select(EmissionRecord)
        .order_by(EmissionRecord.created_at.desc())
        .limit(n)
    )
    if organization_id is not None:
        q = q.where(EmissionRecord.organization_id == organization_id)
    result = await db.execute(q)
    records = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "organization_id": str(r.organization_id) if r.organization_id else None,
            "model": r.model,
            "input_tokens": r.input_tokens,
            "output_tokens": r.output_tokens,
            "carbon_kg_co2eq": float(r.carbon_kg_co2eq),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]
