/**
 * Scenario-based AI inference emissions model.
 * Used for research and policy briefs. Not audited operational totals.
 */

export function calculateEmissions({
  companies,
  tokensPerCompany,
  whPerThousandTokens,
  carbonIntensity,
}) {
  const tokensTotal = companies * tokensPerCompany;
  const energyWh = (tokensTotal / 1000) * whPerThousandTokens;
  const energyKwh = energyWh / 1000;
  const co2Kg = energyKwh * carbonIntensity;

  return {
    tokensTotal,
    energyKwh,
    co2Kg,
    co2Tons: co2Kg / 1000,
  };
}

/**
 * Compute uncertainty range for scenario modeling.
 * Returns central, low, and high annual tons CO₂.
 */
export function calculateRange({
  companies,
  tokensPerCompany,
  whPerThousandTokens,
  carbonIntensity,
}) {
  const central = calculateEmissions({
    companies,
    tokensPerCompany,
    whPerThousandTokens,
    carbonIntensity,
  });

  const low = calculateEmissions({
    companies,
    tokensPerCompany: tokensPerCompany * 0.7,
    whPerThousandTokens: whPerThousandTokens * 0.8,
    carbonIntensity: carbonIntensity * 0.8,
  });

  const high = calculateEmissions({
    companies,
    tokensPerCompany: tokensPerCompany * 1.3,
    whPerThousandTokens: whPerThousandTokens * 1.2,
    carbonIntensity: carbonIntensity * 1.2,
  });

  return {
    centralAnnualTons: central.co2Tons * 12,
    lowAnnualTons: low.co2Tons * 12,
    highAnnualTons: high.co2Tons * 12,
  };
}
