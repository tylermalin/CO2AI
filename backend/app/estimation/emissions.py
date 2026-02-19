"""Emissions conversion from energy and carbon intensity."""


def emissions_kg_co2eq(
    energy_kwh: float,
    carbon_intensity_g_per_kwh: float,
) -> float:
    """Convert energy (kWh) to kg CO2eq using carbon intensity.

    co2_kg = energy_kwh * (carbon_intensity_g_per_kwh / 1000)
    """
    return energy_kwh * (carbon_intensity_g_per_kwh / 1000)
