"""Unit tests for carbon estimation engine."""

import pytest

from app.estimation import (
    A100_FP16_FLOPS_PER_JOULE,
    DEFAULT_PUE,
    H100_FP8_FLOPS_PER_JOULE,
    emissions_kg_co2eq,
    energy_kwh,
    estimate_carbon,
    flops_per_token,
    total_flops,
)


class TestFlops:
    def test_flops_per_token_7b(self) -> None:
        """7B model → 14e9 FLOPs/token."""
        assert flops_per_token(7_000_000_000) == 14_000_000_000

    def test_flops_per_token_70b(self) -> None:
        """70B model → 140e9 FLOPs/token."""
        assert flops_per_token(70_000_000_000) == 140_000_000_000

    def test_total_flops(self) -> None:
        """active_params × token_count × 2."""
        assert total_flops(1_000_000_000, 100) == 200_000_000_000


class TestEnergy:
    def test_energy_kwh_from_flops(self) -> None:
        """Known FLOPs + efficiency → kWh."""
        flops = 1e12  # 1 trillion FLOPs
        efficiency = 1e11  # 100 GFLOPS/J
        energy = energy_kwh(flops, efficiency, pue=1.0)
        # energy_joules = 1e12 / 1e11 = 10 J
        # energy_kwh = 10 / 3_600_000 ≈ 2.78e-6
        expected = 10 / 3_600_000
        assert energy == pytest.approx(expected, rel=1e-9)

    def test_energy_kwh_pue_adjustment(self) -> None:
        """PUE 1.2 increases effective energy."""
        flops = 1e12
        efficiency = 1e11
        energy_pue_1 = energy_kwh(flops, efficiency, pue=1.0)
        energy_pue_12 = energy_kwh(flops, efficiency, pue=1.2)
        assert energy_pue_12 == pytest.approx(energy_pue_1 * 1.2, rel=1e-9)


class TestEmissions:
    def test_emissions_kg_co2eq(self) -> None:
        """energy_kwh × carbon_intensity → kg."""
        # 1 kWh at 400 g/kWh = 0.4 kg CO2eq
        result = emissions_kg_co2eq(1.0, 400.0)
        assert result == pytest.approx(0.4, rel=1e-9)


class TestEstimateCarbon:
    def test_estimate_carbon_end_to_end(self) -> None:
        """Full pipeline: params → tokens → kg CO2eq."""
        # 7B model, 100 tokens, H100, 400 g/kWh, PUE 1.2
        result = estimate_carbon(
            active_params=7_000_000_000,
            token_count=100,
            hardware_efficiency=H100_FP8_FLOPS_PER_JOULE,
            carbon_intensity_g_per_kwh=400.0,
            pue=DEFAULT_PUE,
        )
        # total_flops = 2 * 7e9 * 100 = 1.4e12
        # energy_joules = 1.4e12 / 1e11 = 14 J
        # energy_kwh = 14 / 3.6e6 * 1.2 ≈ 4.67e-6 kWh
        # co2_kg = 4.67e-6 * 0.4 ≈ 1.87e-6 kg
        assert result > 0
        assert result < 1e-3  # Small value for 100 tokens
        assert result == pytest.approx(1.8666666666666668e-6, rel=1e-6)
