"""Service layer - modular, registry-loaded."""

from app.services.registry import ServiceRegistry, get_service

__all__ = ["get_service", "ServiceRegistry", "get_carbon_intensity_provider"]


def get_carbon_intensity_provider():
    """Return Electricity Maps provider if key set, else default (no API calls)."""
    from app.config import get_settings
    from app.services.default_intensity_provider import DefaultIntensityProvider
    from app.services.electricity_maps_provider import ElectricityMapsProvider

    settings = get_settings()
    if settings.electricitymap_api_key:
        return ElectricityMapsProvider()
    return DefaultIntensityProvider()
