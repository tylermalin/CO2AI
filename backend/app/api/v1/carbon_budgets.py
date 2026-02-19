"""Carbon budget CRUD - org-level monthly limits."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.carbon_budget import CarbonBudget
from app.models.organization import Organization

router = APIRouter(prefix="/carbon-budgets", tags=["carbon-budgets"])
ORG_HEADER = "X-Organization-Id"


class CarbonBudgetCreate(BaseModel):
    monthly_limit_kg_co2eq: float
    alert_threshold_pct: float = 80.0
    enforcement_enabled: bool = True
    hard_block: bool = False


class CarbonBudgetResponse(BaseModel):
    id: str
    organization_id: str
    monthly_limit_kg_co2eq: float
    alert_threshold_pct: float
    enforcement_enabled: bool
    hard_block: bool


def _parse_org_id(header_value: str | None) -> uuid.UUID | None:
    if not header_value or not header_value.strip():
        return None
    try:
        return uuid.UUID(header_value.strip())
    except (ValueError, TypeError):
        return None


@router.get("", response_model=CarbonBudgetResponse | None)
async def get_budget(
    db: AsyncSession = Depends(get_db),
    x_organization_id: str | None = Header(None, alias=ORG_HEADER),
) -> CarbonBudgetResponse | None:
    """Get carbon budget for org. Returns None if not configured."""
    org_id = _parse_org_id(x_organization_id)
    if org_id is None:
        raise HTTPException(400, "X-Organization-Id header required")
    q = select(CarbonBudget).where(CarbonBudget.organization_id == org_id)
    result = await db.execute(q)
    budget = result.scalar_one_or_none()
    if budget is None:
        return None
    return CarbonBudgetResponse(
        id=str(budget.id),
        organization_id=str(budget.organization_id),
        monthly_limit_kg_co2eq=float(budget.monthly_limit_kg_co2eq),
        alert_threshold_pct=float(budget.alert_threshold_pct),
        enforcement_enabled=budget.enforcement_enabled,
        hard_block=budget.hard_block,
    )


@router.post("", response_model=CarbonBudgetResponse)
async def create_or_update_budget(
    body: CarbonBudgetCreate,
    db: AsyncSession = Depends(get_db),
    x_organization_id: str | None = Header(None, alias=ORG_HEADER),
) -> CarbonBudgetResponse:
    """Create or update carbon budget for org. Creates org if missing."""
    org_id = _parse_org_id(x_organization_id)
    if org_id is None:
        raise HTTPException(400, "X-Organization-Id header required")

    # Ensure org exists
    q = select(Organization).where(Organization.id == org_id)
    result = await db.execute(q)
    org = result.scalar_one_or_none()
    if org is None:
        org = Organization(id=org_id, name=f"org-{org_id}")
        db.add(org)
        await db.flush()

    q = select(CarbonBudget).where(CarbonBudget.organization_id == org_id)
    result = await db.execute(q)
    budget = result.scalar_one_or_none()
    if budget is None:
        budget = CarbonBudget(
            organization_id=org_id,
            monthly_limit_kg_co2eq=body.monthly_limit_kg_co2eq,
            alert_threshold_pct=body.alert_threshold_pct,
            enforcement_enabled=body.enforcement_enabled,
            hard_block=body.hard_block,
        )
        db.add(budget)
    else:
        budget.monthly_limit_kg_co2eq = body.monthly_limit_kg_co2eq
        budget.alert_threshold_pct = body.alert_threshold_pct
        budget.enforcement_enabled = body.enforcement_enabled
        budget.hard_block = body.hard_block
    await db.flush()
    await db.refresh(budget)
    return CarbonBudgetResponse(
        id=str(budget.id),
        organization_id=str(budget.organization_id),
        monthly_limit_kg_co2eq=float(budget.monthly_limit_kg_co2eq),
        alert_threshold_pct=float(budget.alert_threshold_pct),
        enforcement_enabled=budget.enforcement_enabled,
        hard_block=budget.hard_block,
    )
