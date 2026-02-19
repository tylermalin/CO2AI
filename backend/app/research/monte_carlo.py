"""
Monte Carlo simulation for AI inference carbon emissions.

Models parameter uncertainty via random sampling. Returns distribution
statistics and downsampled samples for visualization.
"""

import numpy as np


def run_monte_carlo_simulation(
    companies: int,
    base_tokens_per_company: float,
    base_wh_per_1k_tokens: float,
    base_carbon_intensity: float,
    iterations: int = 10000,
    seed: int | None = None,
) -> dict:
    """
    Run Monte Carlo simulation for annual CO₂ emissions (metric tons).

    Parameters are sampled from normal distributions; negatives are truncated to 0.
    """
    rng = np.random.default_rng(seed)

    # Sample parameters: Normal(mean, std), truncate negatives
    tokens_std = 0.2 * base_tokens_per_company
    tokens = rng.normal(base_tokens_per_company, tokens_std, iterations)
    tokens = np.maximum(tokens, 0)

    wh_std = 0.15 * base_wh_per_1k_tokens
    wh = rng.normal(base_wh_per_1k_tokens, wh_std, iterations)
    wh = np.maximum(wh, 0)

    carbon_std = 0.2 * base_carbon_intensity
    carbon = rng.normal(base_carbon_intensity, carbon_std, iterations)
    carbon = np.maximum(carbon, 0)

    # Per iteration: energy_kwh, co2_kg, annual_tons
    tokens_total = companies * tokens
    energy_wh = (tokens_total / 1000) * wh
    energy_kwh = energy_wh / 1000
    co2_kg = energy_kwh * carbon
    co2_tons_monthly = co2_kg / 1000
    annual_tons = co2_tons_monthly * 12

    # Statistics
    mean_val = float(np.mean(annual_tons))
    median_val = float(np.median(annual_tons))
    p10_val = float(np.percentile(annual_tons, 10))
    p90_val = float(np.percentile(annual_tons, 90))

    # Downsample to 1000 points for frontend
    if len(annual_tons) > 1000:
        idx = rng.choice(len(annual_tons), size=1000, replace=False)
        samples = annual_tons[idx].tolist()
    else:
        samples = annual_tons.tolist()

    return {
        "mean": mean_val,
        "median": median_val,
        "p10": p10_val,
        "p90": p90_val,
        "samples": samples,
    }
