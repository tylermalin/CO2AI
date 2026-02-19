"""Carbon estimation engine - pure, deterministic functions."""

from app.estimation.emissions import emissions_kg_co2eq
from app.estimation.energy import energy_kwh
from app.estimation.flops import flops_per_token, total_flops

from app.estimation.constants import (
    A100_FP16_FLOPS_PER_JOULE,
    DEFAULT_PUE,
    H100_FP8_FLOPS_PER_JOULE,
    JOULES_PER_KWH,
)

__all__ = [
    "flops_per_token",
    "total_flops",
    "energy_kwh",
    "emissions_kg_co2eq",
    "estimate_carbon",
    "H100_FP8_FLOPS_PER_JOULE",
    "A100_FP16_FLOPS_PER_JOULE",
    "DEFAULT_PUE",
    "JOULES_PER_KWH",
]


def estimate_carbon(
    active_params: int,
    token_count: int,
    hardware_efficiency: float,
    carbon_intensity_g_per_kwh: float,
    pue: float = DEFAULT_PUE,
) -> float:
    """Convenience: full pipeline from params + tokens to kg CO2eq."""
    flops = total_flops(active_params, token_count)
    energy = energy_kwh(flops, hardware_efficiency, pue)
    return emissions_kg_co2eq(energy, carbon_intensity_g_per_kwh)
