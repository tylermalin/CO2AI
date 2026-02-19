import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// Ensure relative URL works with proxy
const api = axios.create({ baseURL: API_BASE });

function QuickCarbonEstimate() {
  const [monthlySpend, setMonthlySpend] = useState('');
  const [pctGpt4, setPctGpt4] = useState(50);
  const [pctGpt35, setPctGpt35] = useState(50);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const spend = parseFloat(monthlySpend);
    if (isNaN(spend) || spend < 0) {
      setError('Enter a valid monthly spend');
      return;
    }
    if (pctGpt4 + pctGpt35 > 100) {
      setError('Model percentages must sum to 100 or less');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/quick-estimate', {
        monthly_spend_usd: spend,
        pct_gpt4: pctGpt4,
        pct_gpt35: pctGpt35,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to estimate');
    } finally {
      setLoading(false);
    }
  };

  const industryLabel = {
    below: 'Below typical AI startup',
    average: 'Typical for AI workloads',
    above: 'Above typical AI startup',
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
            Mālama AI Carbon
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              ← Back
            </Link>
            <Link
              to="/dashboard"
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">
            Quick Carbon Estimate
          </h2>
          <p className="text-[var(--color-text-muted)] mt-2">
            Get your estimated AI emissions in seconds. No signup required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Monthly OpenAI spend (USD)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Model mix
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[var(--color-text-muted)]">GPT-4 / GPT-4o</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pctGpt4}
                  onChange={(e) => setPctGpt4(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <span className="text-sm text-[var(--color-text)]">{pctGpt4}%</span>
              </div>
              <div>
                <span className="text-xs text-[var(--color-text-muted)]">GPT-3.5</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pctGpt35}
                  onChange={(e) => setPctGpt35(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <span className="text-sm text-[var(--color-text)]">{pctGpt35}%</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !monthlySpend}
            className="w-full py-3 px-4 bg-[var(--color-accent)] text-[var(--color-bg)] font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? 'Calculating…' : 'Estimate emissions'}
          </button>
        </form>

        {result && (
          <div className="mt-10 space-y-6">
            <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                Monthly CO₂
              </h3>
              <p className="text-3xl font-bold text-[var(--color-accent)]">
                {result.monthly_kg_co2eq < 0.01
                  ? result.monthly_kg_co2eq.toExponential(2)
                  : result.monthly_kg_co2eq.toFixed(2)}{' '}
                kg
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                ~{result.tokens_estimated.toLocaleString()} tokens estimated
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] uppercase">Equivalent to</p>
                <p className="text-lg font-semibold text-[var(--color-text)] mt-1">
                  {result.equivalent_flights < 0.01 ? '< 0.01' : result.equivalent_flights} flights
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">NYC → LA</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] uppercase">Or</p>
                <p className="text-lg font-semibold text-[var(--color-text)] mt-1">
                  {result.equivalent_trees_months.toFixed(0)} trees
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">to offset / month</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] uppercase">Or</p>
                <p className="text-lg font-semibold text-[var(--color-text)] mt-1">
                  {result.equivalent_home_days.toFixed(1)} days
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">US home energy</p>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-muted)]">Industry comparison</p>
              <p className="text-[var(--color-text)] font-medium mt-1">
                {industryLabel[result.industry_comparison]}
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--color-border)] text-center">
              <p className="text-[var(--color-text-muted)] text-sm mb-4">
                This is an estimate. Connect your API for precise tracking.
              </p>
              <Link
                to="/dashboard"
                className="inline-block py-3 px-6 bg-[var(--color-accent)] text-[var(--color-bg)] font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Connect API for precise tracking
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default QuickCarbonEstimate;
