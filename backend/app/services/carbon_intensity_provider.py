"""Carbon intensity provider - mockable interface for Electricity Maps integration."""

from abc import ABC, abstractmethod


class CarbonIntensityProvider(ABC):
    """Abstract interface for carbon intensity lookup. Mockable in tests."""

    @abstractmethod
    async def get_carbon_intensity_g_per_kwh(self, zone: str) -> float:
        """
        Return carbon intensity in g CO2eq/kWh for the given zone.
        Falls back to default on error.
        """
        ...
