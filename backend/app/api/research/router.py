"""Research endpoints: policy brief PDF, Monte Carlo simulation, etc."""

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.research.monte_carlo import run_monte_carlo_simulation
from app.research.pdf_generator import build_policy_brief_pdf

router = APIRouter(prefix="/api/research", tags=["research"])


@router.get("/monte-carlo")
def get_monte_carlo(
    companies: int = Query(..., ge=1, le=1_000_000),
    tokens_per_company: float = Query(..., ge=100_000, le=1e9),
    wh_per_1k: float = Query(..., ge=0.1, le=2),
    carbon_intensity: float = Query(..., ge=0.05, le=1),
    iterations: int = Query(10_000, ge=1000, le=50_000),
):
    """Run Monte Carlo simulation for probabilistic emissions projection."""
    result = run_monte_carlo_simulation(
        companies=companies,
        base_tokens_per_company=tokens_per_company,
        base_wh_per_1k_tokens=wh_per_1k,
        base_carbon_intensity=carbon_intensity,
        iterations=iterations,
    )
    return result


@router.get("/outlook-2026.pdf")
def get_outlook_pdf():
    """Return AI Carbon Outlook 2026 policy brief as PDF."""
    pdf_bytes = build_policy_brief_pdf()
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=AI_Carbon_Outlook_2026.pdf",
        },
    )
