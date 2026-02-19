"""Generate AI Carbon Outlook 2026 policy brief PDF."""

from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def build_policy_brief_pdf() -> bytes:
    """Build the AI Carbon Outlook 2026 policy brief as PDF bytes."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        name="PolicyTitle",
        parent=styles["Heading1"],
        fontSize=18,
        spaceAfter=12,
    )
    heading_style = ParagraphStyle(
        name="SectionHeading",
        parent=styles["Heading2"],
        fontSize=12,
        spaceBefore=16,
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        name="Body",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=8,
    )
    small_style = ParagraphStyle(
        name="Small",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        spaceAfter=6,
    )

    story = []

    story.append(Paragraph("AI Carbon Outlook 2026", title_style))
    story.append(Paragraph(
        "Scenario-based modeling of AI inference emissions across industries. "
        "AICo2 Research.",
        body_style,
    ))
    story.append(Spacer(1, 0.25 * inch))

    story.append(Paragraph("Executive Summary", heading_style))
    story.append(Paragraph(
        "This policy brief presents scenario-based estimates of AI inference emissions "
        "for enterprise adoption across six industry segments. Using token usage assumptions, "
        "hardware efficiency parameters, and grid carbon intensity, we model annual CO₂ "
        "emissions under illustrative scenarios. Results are not audited operational totals "
        "and should be interpreted as research projections.",
        body_style,
    ))
    story.append(Spacer(1, 0.15 * inch))

    story.append(Paragraph("Key Findings", heading_style))
    data = [
        ["Finding", "Description"],
        [
            "Industry scope",
            "IT Services, Computer Software, Higher Education, Internet, Marketing & Advertising, Financial Services",
        ],
        [
            "Model inputs",
            "Tokens per company, Wh per 1k tokens, grid carbon intensity (kg CO₂/kWh)",
        ],
        [
            "Uncertainty",
            "±20–30% parameter sensitivity; low/central/high scenarios",
        ],
        [
            "Optimization",
            "Carbon-aware routing can reduce emissions when applied to inference workloads",
        ],
    ]
    table = Table(data, colWidths=[1.5 * inch, 4.5 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), "#e0e0e0"),
                ("TEXTCOLOR", (0, 0), (-1, 0), "#333333"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("BACKGROUND", (0, 1), (-1, -1), "#ffffff"),
                ("TEXTCOLOR", (0, 0), (-1, -1), "#333333"),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, "#cccccc"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph("Methodology Summary", heading_style))
    story.append(Paragraph(
        "Emissions are computed as: tokens_total × (Wh/1000 tokens) × carbon_intensity. "
        "Token usage is modeled per company; energy per token reflects hardware efficiency; "
        "carbon intensity uses global average grid factors. Industry company counts are "
        "derived from representative datasets. Optimization impact assumes carbon-aware "
        "routing reduces effective emissions by a configurable percentage.",
        body_style,
    ))
    story.append(Spacer(1, 0.15 * inch))

    story.append(Paragraph("Uncertainty Note", heading_style))
    story.append(Paragraph(
        "The shaded region in the interactive model represents a ±20–30% parameter "
        "sensitivity range. Low scenario: tokens × 0.7, Wh × 0.8, carbon × 0.8. "
        "High scenario: tokens × 1.3, Wh × 1.2, carbon × 1.2. These multipliers "
        "reflect plausible variation in adoption and efficiency assumptions.",
        body_style,
    ))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph("References", heading_style))
    refs = [
        "Henderson et al. (2020). Towards the Systematic Reporting of the Energy and Carbon Footprints of Machine Learning. JMLR.",
        "Strubell et al. (2019). Energy and Policy Considerations for Deep Learning in NLP. ACL.",
        "Patterson et al. (2021). Carbon Emissions and Large Neural Network Training. arXiv.",
        "Green Software Foundation. SCI Specification.",
        "GHG Protocol Scope 2 Guidance.",
        "Electricity Maps API documentation.",
    ]
    for i, ref in enumerate(refs, 1):
        story.append(Paragraph(f"{i}. {ref}", small_style))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph(
        "— AICo2 Research. Not audited. For illustrative use only.",
        small_style,
    ))

    doc.build(story)
    return buffer.getvalue()
