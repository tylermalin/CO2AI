import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { calculateEmissions, calculateRange } from '../utils/carbonModel';
import { AreaChart, Area, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import ExecutiveSummary from '../components/research/ExecutiveSummary';
import AdoptionContextCharts from '../components/research/AdoptionContextCharts';
import AssumptionSliders from '../components/research/AssumptionSliders';
import EmissionsResults from '../components/research/EmissionsResults';
import IndustryBreakdownChart from '../components/research/IndustryBreakdownChart';
import OptimizationImpactChart from '../components/research/OptimizationImpactChart';
import LimitationsSection from '../components/research/LimitationsSection';
import ProbabilisticModelingSection from '../components/research/ProbabilisticModelingSection';
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
  const [monteCarloResult, setMonteCarloResult] = useState(null);
  const [monteCarloLoading, setMonteCarloLoading] = useState(false);

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

  useEffect(() => {
    const title = 'AI Carbon Outlook 2026 | Mālama AI Carbon Research';
    const description = 'Scenario-based modeling of AI inference emissions across industries. Policy brief with uncertainty bands, methodology, and citations.';
    document.title = title;
    const setMeta = (attr, key, val) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'article');
    setMeta('name', 'robots', 'index, follow');
    return () => {
      document.title = 'Mālama AI Carbon – Make AI measurable. Make AI accountable.';
    };
  }, []);

  const runMonteCarlo = async () => {
    setMonteCarloLoading(true);
    setMonteCarloResult(null);
    try {
      const params = new URLSearchParams({
        companies: String(totalCompanies),
        tokens_per_company: String(tokensPerCompany),
        wh_per_1k: String(whPerThousand),
        carbon_intensity: String(carbonIntensity),
        iterations: '10000',
      });
      const res = await fetch(`/api/research/monte-carlo?${params}`);
      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      setMonteCarloResult(data);
    } catch (err) {
      setMonteCarloResult({ error: err.message });
    } finally {
      setMonteCarloLoading(false);
    }
  };

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
    <article className="research-page min-h-screen bg-[#0b0f14] text-[var(--color-text)]">
      <nav className="sticky top-0 z-10 border-b border-[var(--color-border)]/60 bg-[#0b0f14]/95 backdrop-blur">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
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

      <main className="mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <ExecutiveSummary />
          <a
            href="/api/research/outlook-2026.pdf"
            download="AI_Carbon_Outlook_2026.pdf"
            className="shrink-0 px-4 py-2 text-sm border border-[var(--color-border)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors self-start"
          >
            Download Policy Brief (PDF)
          </a>
        </div>
        <AdoptionContextCharts />

        <section className="research-section">
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

        <section className="research-section">
          <h2 className="text-xl font-medium text-[var(--color-text)] mb-4">
            Results
          </h2>
          <EmissionsResults result={result} optimizedCo2Kg={optimizedCo2Kg} />
        </section>

        <ProbabilisticModelingSection />

        <section className="research-section">
          <h2 className="text-xl font-medium text-[var(--color-text)] mb-4">
            Monte Carlo Simulation
          </h2>
          <button
            type="button"
            onClick={runMonteCarlo}
            disabled={monteCarloLoading}
            className="px-4 py-2 text-sm border border-[var(--color-border)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {monteCarloLoading ? 'Running…' : 'Run Monte Carlo Simulation'}
          </button>
          {monteCarloResult?.error && (
            <p className="mt-4 text-sm text-[var(--color-danger)]">{monteCarloResult.error}</p>
          )}
          {monteCarloResult && !monteCarloResult.error && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Mean</p>
                  <p className="text-lg font-semibold text-[var(--color-text)] mt-1">{monteCarloResult.mean.toFixed(1)} t</p>
                </div>
                <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Median (P50)</p>
                  <p className="text-lg font-semibold text-[var(--color-text)] mt-1">{monteCarloResult.median.toFixed(1)} t</p>
                </div>
                <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">P10</p>
                  <p className="text-lg font-semibold text-[var(--color-text)] mt-1">{monteCarloResult.p10.toFixed(1)} t</p>
                </div>
                <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">P90</p>
                  <p className="text-lg font-semibold text-[var(--color-text)] mt-1">{monteCarloResult.p90.toFixed(1)} t</p>
                </div>
              </div>
              {(() => {
                const samples = monteCarloResult.samples || [];
                const numBins = 20;
                const min = Math.min(...samples);
                const max = Math.max(...samples);
                const binWidth = Math.max((max - min) / numBins, 0.001);
                const bins = Array.from({ length: numBins }, (_, i) => ({
                  binMid: min + (i + 0.5) * binWidth,
                  binLabel: `${(min + i * binWidth).toFixed(0)}–${(min + (i + 1) * binWidth).toFixed(0)}`,
                  count: 0,
                }));
                samples.forEach((v) => {
                  const idx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
                  if (idx >= 0) bins[idx].count += 1;
                });
                return (
                  <div className="mt-8">
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                      Distribution of annual CO₂ emissions under modeled parameter uncertainty.
                    </p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bins} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="binLabel" stroke="var(--color-text-muted)" fontSize={10} angle={-45} textAnchor="end" height={50} />
                          <YAxis stroke="var(--color-text-muted)" fontSize={11} allowDecimals={false} />
                          <ReferenceLine x={bins[Math.min(Math.floor((monteCarloResult.p10 - min) / binWidth), numBins - 1)]?.binLabel} stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 2" />
                          <ReferenceLine x={bins[Math.min(Math.floor((monteCarloResult.median - min) / binWidth), numBins - 1)]?.binLabel} stroke="#4fd1c5" strokeWidth={2} strokeDasharray="4 2" />
                          <ReferenceLine x={bins[Math.min(Math.floor((monteCarloResult.p90 - min) / binWidth), numBins - 1)]?.binLabel} stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 2" />
                          <Bar dataKey="count" fill="#4fd1c5" fillOpacity={0.6} name="Frequency" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                      Vertical lines: P10, P50 (median), P90. P10–P90 span 80% confidence interval.
                    </p>
                  </div>
                );
              })()}
            </>
          )}
        </section>

        <section className="research-section">
          <h2 className="text-xl font-medium text-[var(--color-text)] mb-2">
            Uncertainty Range
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Shaded region represents modeled uncertainty range (±20–30% parameter sensitivity)
            (Patterson et al., 2021)<sup><a href="#ref-3" className="text-[var(--color-accent)] no-underline" aria-label="Reference 3">[3]</a></sup>.
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
        <div className="mb-16">
          <a
            href="/api/research/outlook-2026.pdf"
            download="AI_Carbon_Outlook_2026.pdf"
            className="inline-block px-4 py-2 text-sm border border-[var(--color-border)] rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
          >
            Download Policy Brief (PDF)
          </a>
        </div>
        <ReferencesSection />
      </main>
    </article>
  );
}
