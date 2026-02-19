"""Electricity Maps API - async carbon intensity with 5-min in-memory cache."""

import time
from typing import Any

import httpx

from app.config import get_settings
from app.services.carbon_intensity_provider import CarbonIntensityProvider

API_BASE = "https://api.electricitymaps.com"
CACHE_TTL_SECONDS = 300  # 5 minutes


class ElectricityMapsProvider(CarbonIntensityProvider):
    """Real-time carbon intensity from Electricity Maps. In-memory cache, 5-min TTL."""

    def __init__(
        self,
        api_key: str | None = None,
        default_intensity: float = 400.0,
        cache_ttl: int = CACHE_TTL_SECONDS,
    ) -> None:
        self._api_key = api_key or get_settings().electricitymap_api_key
        self._default = default_intensity or get_settings().carbon_intensity_g_per_kwh
        self._cache_ttl = cache_ttl
        self._cache: dict[str, tuple[float, float]] = {}  # zone -> (intensity, expires_at)

    async def get_carbon_intensity_g_per_kwh(self, zone: str) -> float:
        """Fetch carbon intensity for zone. Cached 5 min. Fallback to default on error."""
        now = time.monotonic()
        if zone in self._cache:
            cached_val, expires = self._cache[zone]
            if now < expires:
                return cached_val
            del self._cache[zone]

        if not self._api_key:
            return self._default

        try:
            intensity = await _fetch_intensity(self._api_key, zone)
            self._cache[zone] = (intensity, now + self._cache_ttl)
            return intensity
        except Exception:
            return self._default


async def _fetch_intensity(api_key: str, zone: str) -> float:
    """Async HTTP call to Electricity Maps past endpoint (current hour)."""
    from datetime import datetime, timezone

    # Use current UTC hour for "latest" equivalent
    dt = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:00:00.000Z")
    url = f"{API_BASE}/v3/carbon-intensity/past"
    params = {"zone": zone, "datetime": dt}
    headers = {"auth-token": api_key}

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params, headers=headers)
        response.raise_for_status()
    data: dict[str, Any] = response.json()
    return float(data.get("carbonIntensity", 400))
