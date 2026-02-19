"""Carbon-aware routing engine - select region by mode before forwarding."""

from dataclasses import dataclass
from typing import Any

from app.api.proxy.models import get_active_params
from app.config import get_settings
from app.estimation import estimate_carbon


RoutingMode = str  # "standard" | "optimize" | "latency_priority"


@dataclass
class RoutingDecision:
    zone: str
    base_url: str
    mode: str
    reason: str
    estimated_emissions_kg: float | None
    region_estimates: list[dict[str, Any]] | None  # [{zone, intensity, estimated_kg}, ...]


def _estimate_tokens_from_request(body: dict) -> int:
    """Rough token estimate from request body for pre-forward routing."""
    messages = body.get("messages") or []
    input_chars = sum(len(str(m.get("content", ""))) for m in messages)
    input_tokens = max(1, input_chars // 4)
    max_tokens = body.get("max_tokens") or 100
    output_estimate = min(max_tokens, 500) if isinstance(max_tokens, int) else 100
    return input_tokens + output_estimate


async def select_region(
    body: dict,
    mode: str,
    explicit_region: str | None,
    carbon_intensity_provider,
) -> RoutingDecision:
    """
    Select upstream region for routing. Must not block if carbon API fails.
    - standard: use explicit_region or first region
    - optimize: estimate emissions per region, pick lowest (non-blocking on API fail)
    - latency_priority: use first region immediately, skip carbon lookup
    """
    settings = get_settings()
    regions = settings.get_regions()
    if not regions:
        first = {
            "zone": settings.electricitymap_default_zone,
            "base_url": settings.openai_base_url.rstrip("/"),
        }
        regions = [first]

    model = body.get("model") or "gpt-4"
    active_params = get_active_params(model, settings.default_model_params)
    est_tokens = _estimate_tokens_from_request(body)

    if mode == "latency_priority":
        r = regions[0]
        return RoutingDecision(
            zone=r["zone"],
            base_url=r["base_url"],
            mode=mode,
            reason="latency_priority: use first region",
            estimated_emissions_kg=None,
            region_estimates=None,
        )

    if mode == "standard" and explicit_region:
        for r in regions:
            if r["zone"] == explicit_region:
                return RoutingDecision(
                    zone=r["zone"],
                    base_url=r["base_url"],
                    mode=mode,
                    reason=f"standard: explicit region {explicit_region}",
                    estimated_emissions_kg=None,
                    region_estimates=None,
                )
        # Fallback: use first matching or first region
        r = regions[0]
        return RoutingDecision(
            zone=r["zone"],
            base_url=r["base_url"],
            mode=mode,
            reason=f"standard: explicit {explicit_region} not in config, use {r['zone']}",
            estimated_emissions_kg=None,
            region_estimates=None,
        )

    if mode == "standard":
        r = regions[0]
        return RoutingDecision(
            zone=r["zone"],
            base_url=r["base_url"],
            mode=mode,
            reason=f"standard: default region {r['zone']}",
            estimated_emissions_kg=None,
            region_estimates=None,
        )

    # optimize: get intensities, estimate per region, pick lowest
    region_estimates: list[dict[str, Any]] = []
    default_intensity = settings.carbon_intensity_g_per_kwh

    for r in regions:
        zone = r["zone"]
        try:
            intensity = await carbon_intensity_provider.get_carbon_intensity_g_per_kwh(zone)
        except Exception:
            intensity = default_intensity
        est_kg = estimate_carbon(
            active_params=active_params,
            token_count=est_tokens,
            hardware_efficiency=settings.hardware_efficiency_flops_per_joule,
            carbon_intensity_g_per_kwh=intensity,
        )
        region_estimates.append({
            "zone": zone,
            "carbon_intensity_g_per_kwh": intensity,
            "estimated_kg_co2eq": est_kg,
        })

    if not region_estimates:
        r = regions[0]
        return RoutingDecision(
            zone=r["zone"],
            base_url=r["base_url"],
            mode=mode,
            reason="optimize: fallback to first region (no estimates)",
            estimated_emissions_kg=None,
            region_estimates=None,
        )

    best = min(region_estimates, key=lambda x: x["estimated_kg_co2eq"])
    chosen = next((r for r in regions if r["zone"] == best["zone"]), regions[0])

    return RoutingDecision(
        zone=chosen["zone"],
        base_url=chosen["base_url"],
        mode=mode,
        reason=f"optimize: lowest carbon {best['zone']} ({best['estimated_kg_co2eq']:.2e} kg est)",
        estimated_emissions_kg=best["estimated_kg_co2eq"],
        region_estimates=region_estimates,
    )
