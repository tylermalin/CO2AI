"""Tests for emissions ledger - DB writes and aggregation queries."""

import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import async_session_maker, init_db
from app.services.emission_ledger import (
    daily_totals,
    last_n_requests,
    log_emission,
    monthly_total,
)

pytestmark = pytest.mark.asyncio


@pytest.fixture
async def db_session():
    """Provide a real DB session. Requires Postgres (docker compose up)."""
    await init_db()
    async with async_session_maker() as session:
        yield session
        await session.rollback()


async def test_emission_ledger_db_writes_and_aggregations(db_session: AsyncSession) -> None:
    """Single test: log emissions, verify persistence, run aggregation queries."""
    org_id = uuid.uuid4()

    # Log emission with org
    record = await log_emission(
        db_session,
        organization_id=org_id,
        model="gpt-4o-mini",
        input_tokens=10,
        output_tokens=5,
        carbon_kg_co2eq=1.5e-6,
    )
    await db_session.commit()

    assert record.id is not None
    assert record.organization_id == org_id
    assert record.model == "gpt-4o-mini"
    assert float(record.carbon_kg_co2eq) == pytest.approx(1.5e-6, rel=1e-9)

    # Log emission without org
    record2 = await log_emission(
        db_session,
        organization_id=None,
        model="gpt-4",
        input_tokens=100,
        output_tokens=50,
        carbon_kg_co2eq=2e-5,
    )
    await db_session.commit()
    assert record2.organization_id is None

    # Log more for aggregations
    for i in range(2):
        await log_emission(
            db_session,
            organization_id=org_id,
            model="gpt-4o-mini",
            input_tokens=i,
            output_tokens=i,
            carbon_kg_co2eq=1e-6 * (i + 1),
        )
    await db_session.commit()

    # monthly_total
    total = await monthly_total(db_session, organization_id=org_id)
    assert float(total) >= 1.5e-6

    # last_n_requests (paginated)
    records, total = await last_n_requests(db_session, n=10, organization_id=org_id)
    assert len(records) >= 3
    assert total >= 3
    assert all("carbon_kg_co2eq" in r for r in records)
    assert all("created_at" in r for r in records)

    # daily_totals
    totals = await daily_totals(db_session, organization_id=org_id, days=7)
    assert isinstance(totals, list)
    for item in totals:
        assert "date" in item
        assert "total_kg_co2eq" in item
