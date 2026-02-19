"""Research endpoints: policy brief PDF, etc."""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.research.pdf_generator import build_policy_brief_pdf

router = APIRouter(prefix="/api/research", tags=["research"])


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
