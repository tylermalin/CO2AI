import { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateEmissions, calculateRange } from '../utils/carbonModel';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import ExecutiveSummary from '../components/research/ExecutiveSummary';
import AdoptionContextCharts from '../components/research/AdoptionContextCharts';
import AssumptionSliders from '../components/research/AssumptionSliders';
import EmissionsResults from '../components/research/EmissionsResults';
import IndustryBreakdownChart from '../components/research/IndustryBreakdownChart';
import OptimizationImpactChart from '../components/research/OptimizationImpactChart';
import LimitationsSection from '../components/research/LimitationsSection';
import ReferencesSection from '../components/research/ReferencesSection';

const industries = [
  { name: 'IT Services', companies: 1171 },
  { name: 'Computer Software', companies: 1070 },
  { name: 'Higher Education', companies: 401 },
  { name: 'Internet', companies: 391 },
  { name: 'Marketing & Advertising', companies: 290 },
  { name: 'Financial Services', companies: 245 },
];

export default function ResearchPage() {
  const totalCompanies = industries.reduce((sum, i) => sum + i.companies, 0);

  const [tokensPerCompany, setTokensPerCompany] = useState(25_000_000);
  const [whPerThousand, setWhPerThousand] = useState(0.45);
  const [carbonIntensity, setCarbonIntensity] = useState(0.4);
  const [routingReduction, setRoutingReduction] = useState(0);

  const result = calculateEmissions({
    companies: totalCompanies,
    tokensPerCompany,
    whPerThousandTokens: whPerThousand,
    carbonIntensity,
  });

  const optimizedCo2Kg = result.co2Kg * (1 - routingReduction / 100);

  const range = calculateRange({
    companies: totalCompanies,
    tokensPerCompany,
    whPerThousandTokens: whPerThousand,
    carbonIntensity,
  });

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const lowMonthly = range.lowAnnualTons / 12;
  const centralMonthly = range.centralAnnualTons / 12;
  const highMonthly = range.highAnnualTons / 12;
  const uncertaintyChartData = months.map((name) => ({
    name,
    lowAnnualTons: lowMonthly,
    centralAnnualTons: centralMonthly,
    highAnnualTons: highMonthly,
    bandTons: highMonthly - lowMonthly,
  }));

  const industryResults = industries.map((ind) => {
    const r = calculateEmissions({
      companies: ind.companies,
      tokensPerCompany,
      whPerThousandTokens: whPerThousand,
      carbonIntensity,
    });
    return { name: ind.name, co2Tons: r.co2Tons * 12 };
  });

  return (
    <div className="min-h-screen bg-[#0b0f14] text-[var(--color-text)]">
      <nav className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[#0b0f14]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Mālama AI Carbon
          </Link>
          <Link
            to="/estimate"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Quick Estimate →
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <ExecutiveSummary />
        <AdoptionContextCharts />

        <section className="mb-16">
          <h2 className="text-xl font-medium text-[var(--color-text)] mb-4">
            Model Assumptions
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-2xl">
            Adjust sliders to explore sensitivity. Values reflect illustrative
            scenarios, not audited data.
          </p>
          <AssumptionSliders
            tokensPerCompany={tokensPerCompany}
            setTokensPerCompany={setTokensPerCompany}
            whPerThousand={whPerThousand}
            setWhPerThousand={setWhPerThousand}
            carbonIntensity={carbonIntensity}
            setCarbonIntensity={setCarbonIntensity}
            routingReduction={routingReduction}
            setRoutingReduction={setRoutingReduction}
          />
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-medium text-[var(--color-text)] mb-4">
            Results
          </h2>
          <EmissionsResults result={result} optimizedCo2Kg={optimizedCo2Kg} />
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-medium text-[var(--color-text)] mb-2">
            Uncertainty Range
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Shaded region represents modeled uncertainty range (±20–30% parameter sensitivity).
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uncertaintyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickFormatter={(v) => `${v.toFixed(0)} t`} />
                <Area type="monotone" dataKey="lowAnnualTons" stackId="1" fill="#0b0f14" stroke="none" />
                <Area type="monotone" dataKey="bandTons" stackId="1" fill="#4fd1c5" fillOpacity={0.2} stroke="none" />
                <Line type="monotone" dataKey="centralAnnualTons" stroke="#4fd1c5" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <IndustryBreakdownChart data={industryResults} />

        <OptimizationImpactChart
          baselineTons={result.co2Tons * 12}
          optimizedTons={(optimizedCo2Kg / 1000) * 12}
        />

        <LimitationsSection />
        <ReferencesSection />
      </main>
    </div>
  );
}
