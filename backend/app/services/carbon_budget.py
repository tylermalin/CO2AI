"""Carbon budget check - projected total vs limit, alert threshold, hard block."""

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.carbon_budget import CarbonBudget
from app.services.emission_ledger import monthly_total


@dataclass
class BudgetCheckResult:
    """Result of budget check before committing emission."""

    allowed: bool
    warning: str | None
    current_kg: float
    projected_kg: float
    limit_kg: float
    threshold_pct: float


async def check_budget(
    db: AsyncSession,
    organization_id: uuid.UUID,
    projected_addition_kg: float,
) -> BudgetCheckResult | None:
    """
    Check if adding projected_addition_kg would exceed org budget.
    Returns None if no budget configured (allow). Otherwise BudgetCheckResult.
    """

    q = select(CarbonBudget).where(
        CarbonBudget.organization_id == organization_id,
        CarbonBudget.enforcement_enabled == True,
    )
    result = await db.execute(q)
    budget = result.scalar_one_or_none()
    if budget is None:
        return None

    current = await monthly_total(db, organization_id=organization_id)
    current_float = float(current)
    projected = current_float + projected_addition_kg
    limit_float = float(budget.monthly_limit_kg_co2eq)
    threshold = float(budget.alert_threshold_pct)

    # Hard block: projected exceeds limit
    if budget.hard_block and projected > limit_float:
        return BudgetCheckResult(
            allowed=False,
            warning=None,
            current_kg=current_float,
            projected_kg=projected,
            limit_kg=limit_float,
            threshold_pct=threshold,
        )

    # Soft warning: projected exceeds alert threshold
    threshold_limit = limit_float * (threshold / 100.0)
    warning = None
    if projected > threshold_limit:
        pct = (projected / limit_float * 100) if limit_float > 0 else 0
        warning = (
            f"Carbon budget alert: projected {projected:.6f} kg CO2eq "
            f"({pct:.1f}% of {limit_float} kg limit)"
        )

    return BudgetCheckResult(
        allowed=True,
        warning=warning,
        current_kg=current_float,
        projected_kg=projected,
        limit_kg=limit_float,
        threshold_pct=threshold,
    )
