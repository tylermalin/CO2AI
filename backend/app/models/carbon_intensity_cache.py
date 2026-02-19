"""Carbon intensity cache for ElectricityMap data."""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CarbonIntensityCache(Base):
    """Cached carbon intensity by zone (TTL ~15 min)."""

    __tablename__ = "carbon_intensity_cache"

    zone_code: Mapped[str] = mapped_column(String(50), primary_key=True)
    carbon_intensity_g_per_kwh: Mapped[Decimal] = mapped_column(
        Numeric(20, 6), nullable=False
    )
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
