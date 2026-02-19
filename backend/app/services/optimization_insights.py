"""Optimization insight generator - analyzes emissions data and returns structured suggestions."""

from dataclasses import dataclass
from typing import Literal

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.services.emission_ledger import (
    daily_totals,
    last_n_requests,
    model_breakdown,
    monthly_total,
    routing_mode_stats,
)


InsightCategory = Literal["model", "prompt", "routing", "batching"]


@dataclass
class OptimizationInsight:
    category: InsightCategory
    message: str
    estimated_reduction_percent: float


# Models ordered by size (largest first). Smaller = lower carbon per token.
LARGE_MODELS = {"gpt-4o", "gpt-4-turbo", "gpt-4", "o1"}
SMALL_MODELS = {"gpt-4o-mini", "gpt-3.5-turbo", "gpt-3.5-turbo-16k", "o1-mini"}


def _is_large_model(model: str) -> bool:
    for m in LARGE_MODELS:
        if model.startswith(m) or model == m:
            return True
    return False


def _suggest_smaller_model(model: str) -> str | None:
    """Suggest smaller alternative for a large model."""
    if "gpt-4" in model or "gpt-4o" in model:
        return "gpt-4o-mini"
    if "o1" in model and "mini" not in model:
        return "o1-mini"
    if "gpt-3.5" in model:
        return None  # already small
    return "gpt-4o-mini"


async def generate_insights(
    db: AsyncSession,
    organization_id=None,
    days: int = 30,
) -> list[OptimizationInsight]:
    """
    Analyze emissions data and return structured optimization suggestions.
    """
    insights: list[OptimizationInsight] = []
    settings = get_settings()

    monthly = await monthly_total(db, organization_id=organization_id)
    monthly_float = float(monthly)
    daily = await daily_totals(db, organization_id=organization_id, days=days)
    records, _ = await last_n_requests(db, n=500, organization_id=organization_id)
    model_stats = await model_breakdown(db, organization_id=organization_id, days=days)
    routing_stats = await routing_mode_stats(db, organization_id=organization_id, days=days)

    # Budget utilization
    budget = None
    if organization_id:
        from sqlalchemy import select
        from app.models.carbon_budget import CarbonBudget
        q = select(CarbonBudget).where(CarbonBudget.organization_id == organization_id)
        r = await db.execute(q)
        budget = r.scalar_one_or_none()

    total_requests = sum(r["request_count"] for r in model_stats)
    total_tokens = sum(r["total_tokens"] for r in model_stats)
    avg_tokens_per_request = total_tokens / total_requests if total_requests else 0

    # --- Model size insights ---
    large_model_kg = 0.0
    top_large_model = None
    for stat in model_stats:
        model = stat["model"]
        if _is_large_model(model):
            large_model_kg += stat["total_kg_co2eq"]
            if top_large_model is None:
                top_large_model = model

    if large_model_kg > 0 and monthly_float > 0 and top_large_model:
        pct_from_large = (large_model_kg / monthly_float) * 100
        if pct_from_large > 50:
            suggested = _suggest_smaller_model(top_large_model)
            if suggested:
                insights.append(OptimizationInsight(
                    category="model",
                    message=f"Over {pct_from_large:.0f}% of emissions from large models (gpt-4, o1). Switch to {suggested} for similar quality with ~60–70% lower carbon per token.",
                    estimated_reduction_percent=60.0,
                ))

    # --- Token / prompt insights ---
    if avg_tokens_per_request > 2000 and total_requests >= 10:
        insights.append(OptimizationInsight(
            category="prompt",
            message=f"Average {avg_tokens_per_request:.0f} tokens per request. Reduce prompt length, use concise system messages, or trim context to cut emissions by ~20–40%.",
            estimated_reduction_percent=25.0,
        ))

    if total_tokens > 100_000 and total_requests < 50:
        insights.append(OptimizationInsight(
            category="batching",
            message="High token volume with few requests. Batch similar prompts or use batch API to amortize overhead and reduce total emissions.",
            estimated_reduction_percent=15.0,
        ))

    # --- Routing insights ---
    optimize_count = routing_stats.get("optimize", 0)
    standard_count = routing_stats.get("standard", 0) + routing_stats.get("latency_priority", 0)
    total_routed = optimize_count + standard_count

    if total_routed >= 5 and standard_count > optimize_count:
        regions = settings.get_regions()
        if len(regions) > 1:
            insights.append(OptimizationInsight(
                category="routing",
                message="Most requests use standard routing. Set X-Routing-Mode: optimize to route to lowest-carbon regions. Can reduce emissions 10–40% depending on region mix.",
                estimated_reduction_percent=25.0,
            ))
        else:
            insights.append(OptimizationInsight(
                category="routing",
                message="Add multiple upstream regions (UPSTREAM_REGIONS) and use X-Routing-Mode: optimize for carbon-aware routing.",
                estimated_reduction_percent=20.0,
            ))

    # --- Budget insights ---
    if budget and float(budget.monthly_limit_kg_co2eq) > 0:
        pct = (monthly_float / float(budget.monthly_limit_kg_co2eq)) * 100
        if pct >= float(budget.alert_threshold_pct) and not budget.hard_block:
            insights.append(OptimizationInsight(
                category="routing",
                message=f"Budget at {pct:.0f}% of limit. Enable hard_block to prevent overruns and avoid unexpected costs.",
                estimated_reduction_percent=0.0,  # not a carbon reduction, just safety
            ))
        elif pct < 30 and monthly_float > 0:
            insights.append(OptimizationInsight(
                category="model",
                message="Emissions well under budget. Consider tightening limits or experimenting with smaller models for non-critical workloads.",
                estimated_reduction_percent=0.0,
            ))

    # Default if no insights
    if not insights:
        insights.append(OptimizationInsight(
            category="routing",
            message="Use X-Routing-Mode: optimize to route requests to lowest-carbon regions when multiple regions are configured.",
            estimated_reduction_percent=20.0,
        ))

    return insights
