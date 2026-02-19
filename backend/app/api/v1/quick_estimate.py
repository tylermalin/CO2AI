"""Quick carbon estimate - spend-based, no integration required."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.config import get_settings
from app.estimation import estimate_carbon
from app.api.proxy.models import get_active_params

router = APIRouter(prefix="/quick-estimate", tags=["quick-estimate"])

# Approximate $/1M tokens (OpenAI list pricing, blended input/output)
GPT4_COST_PER_1M_TOKENS = 5.0  # ~$2.50 input + $10 output blended
GPT35_COST_PER_1M_TOKENS = 1.0  # ~$0.50 input + $1.50 output blended


class QuickEstimateRequest(BaseModel):
    monthly_spend_usd: float = Field(ge=0, le=1_000_000, description="Monthly OpenAI spend in USD")
    pct_gpt4: float = Field(ge=0, le=100, default=50, description="Estimated % GPT-4 usage")
    pct_gpt35: float = Field(ge=0, le=100, default=50, description="Estimated % GPT-3.5 usage")
    cost_per_1m_gpt4: float = Field(ge=0.1, le=100, default=GPT4_COST_PER_1M_TOKENS)
    cost_per_1m_gpt35: float = Field(ge=0.1, le=100, default=GPT35_COST_PER_1M_TOKENS)


class QuickEstimateResponse(BaseModel):
    monthly_kg_co2eq: float
    tokens_estimated: int
    equivalent_flights: float  # NYC to LA ~ 0.5 ton = 500 kg
    equivalent_trees_months: float  # ~21 kg CO2/tree/year = 1.75 kg/month
    equivalent_home_days: float  # US home ~20 kg CO2/day
    industry_comparison: str  # "below" | "average" | "above"


@router.post("", response_model=QuickEstimateResponse)
async def quick_estimate(req: QuickEstimateRequest) -> QuickEstimateResponse:
    """
    Estimate monthly CO₂ from OpenAI spend. No auth required.
    Uses FLOPs-based carbon estimation from backend.
    """
    settings = get_settings()

    # Normalize model mix
    total_pct = req.pct_gpt4 + req.pct_gpt35
    if total_pct <= 0:
        pct_gpt4, pct_gpt35 = 0.5, 0.5
    else:
        pct_gpt4 = req.pct_gpt4 / total_pct
        pct_gpt35 = req.pct_gpt35 / total_pct

    # Spend → tokens
    spend_gpt4 = req.monthly_spend_usd * pct_gpt4
    spend_gpt35 = req.monthly_spend_usd * pct_gpt35
    tokens_gpt4 = int((spend_gpt4 / req.cost_per_1m_gpt4) * 1_000_000) if req.cost_per_1m_gpt4 > 0 else 0
    tokens_gpt35 = int((spend_gpt35 / req.cost_per_1m_gpt35) * 1_000_000) if req.cost_per_1m_gpt35 > 0 else 0
    total_tokens = tokens_gpt4 + tokens_gpt35

    # Carbon estimate (GPT-4 and GPT-3.5 params)
    params_gpt4 = get_active_params("gpt-4", settings.default_model_params)
    params_gpt35 = get_active_params("gpt-3.5-turbo", settings.default_model_params)

    kg_gpt4 = estimate_carbon(
        active_params=params_gpt4,
        token_count=tokens_gpt4,
        hardware_efficiency=settings.hardware_efficiency_flops_per_joule,
        carbon_intensity_g_per_kwh=settings.carbon_intensity_g_per_kwh,
    )
    kg_gpt35 = estimate_carbon(
        active_params=params_gpt35,
        token_count=tokens_gpt35,
        hardware_efficiency=settings.hardware_efficiency_flops_per_joule,
        carbon_intensity_g_per_kwh=settings.carbon_intensity_g_per_kwh,
    )
    monthly_kg = kg_gpt4 + kg_gpt35

    # Equivalents
    # NYC-LA flight ~500 kg CO2
    equivalent_flights = monthly_kg / 500.0 if monthly_kg > 0 else 0
    # Tree absorbs ~21 kg/year = 1.75 kg/month
    equivalent_trees_months = monthly_kg / 1.75 if monthly_kg > 0 else 0
    # US home ~20 kg CO2/day
    equivalent_home_days = monthly_kg / 20.0 if monthly_kg > 0 else 0

    # Industry: typical AI startup $1k/mo spend ≈ 50-100 kg. $10k ≈ 500-1000 kg.
    # "Average" band: 50-500 kg. Below 50 = below, 50-500 = average, >500 = above
    if monthly_kg < 50:
        industry_comparison = "below"
    elif monthly_kg <= 500:
        industry_comparison = "average"
    else:
        industry_comparison = "above"

    return QuickEstimateResponse(
        monthly_kg_co2eq=round(monthly_kg, 4),
        tokens_estimated=total_tokens,
        equivalent_flights=round(equivalent_flights, 2),
        equivalent_trees_months=round(equivalent_trees_months, 1),
        equivalent_home_days=round(equivalent_home_days, 1),
        industry_comparison=industry_comparison,
    )
