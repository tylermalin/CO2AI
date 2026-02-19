"""Energy conversion from FLOPs to kWh, with PUE adjustment."""

from app.estimation.constants import DEFAULT_PUE, JOULES_PER_KWH


def energy_kwh(
    flops: int,
    hardware_efficiency: float,
    pue: float = DEFAULT_PUE,
) -> float:
    """Convert FLOPs to effective energy in kWh.

    energy_joules = flops / hardware_efficiency_flops_per_joule
    energy_kwh = energy_joules / JOULES_PER_KWH
    effective_energy_kwh = energy_kwh * pue
    """
    energy_joules = flops / hardware_efficiency
    energy_kwh_raw = energy_joules / JOULES_PER_KWH
    return energy_kwh_raw * pue
