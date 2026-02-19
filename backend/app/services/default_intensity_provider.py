"""Default carbon intensity provider - always returns config default. No API calls."""

from app.config import get_settings
from app.services.carbon_intensity_provider import CarbonIntensityProvider


class DefaultIntensityProvider(CarbonIntensityProvider):
    """Returns config default. Used when Electricity Maps key not set or for testing."""

    def __init__(self, default: float | None = None) -> None:
        self._default = default if default is not None else get_settings().carbon_intensity_g_per_kwh

    async def get_carbon_intensity_g_per_kwh(self, zone: str) -> float:
        return self._default
