import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  getMonthlyTotal,
  getDailyTotals,
  getRecentRequests,
  getBudget,
  getOptimizationInsights,
  runDemoRequest,
  createOrganization,
} from '../api';
import { getStoredOrgId, setStoredOrgId } from '../utils/auth';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function SummaryCard({ title, value, unit, subtitle, format = 'exponential' }) {
  const displayValue =
    value != null
      ? format === 'number'
        ? Number(value).toLocaleString()
        : Number(value).toExponential(3)
      : '—';
  return (
    <div className="bg-surface rounded-xl p-5 border border-(--color-border)">
      <p className="text-sm text-text-muted uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-semibold text-text mt-1">
        {displayValue} {unit}
      </p>
      {subtitle && (
        <p className="text-xs text-text-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function BudgetProgress({ used, limit, threshold }) {
  const pct = limit > 0 ? (used / limit) * 100 : 0;
  const isOver = pct >= 100;
  const isWarning = pct >= (threshold || 80);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-text-muted">Budget used</span>
        <span className={isOver ? 'text-danger' : 'text-text'}>
          {used?.toExponential(3) ?? '—'} / {limit?.toExponential(3) ?? '—'} kg
        </span>
      </div>
      <div className="h-3 bg-(--color-surface-hover) rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isOver ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-accent'
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function RequestHistoryTable({ records }) {
  if (!records?.length) {
    return (
      <p className="text-text-muted text-sm py-8 text-center">
        No requests yet
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text-muted border-b border-(--color-border)">
            <th className="py-3 px-2">Model</th>
            <th className="py-3 px-2">Tokens</th>
            <th className="py-3 px-2">CO₂ (kg)</th>
            <th className="py-3 px-2">Region</th>
            <th className="py-3 px-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr
              key={r.id}
              className="border-b border-(--color-border) hover:bg-(--color-surface-hover)"
            >
              <td className="py-2 px-2 font-mono text-xs">{r.model}</td>
              <td className="py-2 px-2">{r.input_tokens + r.output_tokens}</td>
              <td className="py-2 px-2">{r.carbon_kg_co2eq?.toExponential(3) ?? '—'}</td>
              <td className="py-2 px-2 text-xs">{r.routing_region ?? '—'}</td>
              <td className="py-2 px-2 text-xs text-text-muted">
                {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OptimizationInsights({ insights }) {
  const categoryStyles = {
    model: 'bg-violet-500/10 text-violet-300 border border-violet-500/30',
    prompt: 'bg-blue-500/10 text-blue-300 border border-blue-500/30',
    routing: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    batching: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  };

  if (!insights?.length) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
          Optimization insights
        </h3>
        <p className="text-sm text-text-muted">No insights yet. Run some requests to get suggestions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
        Optimization insights
      </h3>
      <ul className="space-y-2">
        {insights.map((i, idx) => (
          <li
            key={idx}
            className={`text-sm p-3 rounded-lg ${categoryStyles[i.category] || 'bg-(--color-surface-hover) text-text-muted'}`}
          >
            <span className="block font-medium uppercase text-xs opacity-80 mb-1">{i.category}</span>
            <p>{i.message}</p>
            {i.estimated_reduction_percent > 0 && (
              <p className="mt-1.5 text-xs opacity-90">
                Est. reduction: ~{i.estimated_reduction_percent}%
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const [monthly, setMonthly] = useState(null);
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [budget, setBudget] = useState(null);
  const [insights, setInsights] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orgId, setOrgId] = useState(getStoredOrgId);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMessage, setDemoMessage] = useState(null);
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Ensure we have an org on first load (e.g. if user cleared localStorage)
  useEffect(() => {
    if (!orgId && !creatingOrg) {
      setCreatingOrg(true);
      createOrganization()
        .then(({ id }) => {
          setStoredOrgId(id);
          setOrgId(id);
        })
        .catch(() => setError('Could not create organization. Try refreshing.'))
        .finally(() => setCreatingOrg(false));
    }
  }, []);

  useEffect(() => {
    if (!orgId) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          getMonthlyTotal(orgId),
          getDailyTotals(14, orgId),
          getRecentRequests(20, 0, orgId),
          getBudget(orgId),
          getOptimizationInsights(orgId, 30),
        ]);
        const [monthlyVal, dailyVal, recentVal, budgetVal, insightsVal] = results.map((r, i) => {
          if (r.status === 'fulfilled') return r.value;
          if (i === 3) return null;
          throw r.reason;
        });
        setMonthly(monthlyVal);
        setDaily(dailyVal || []);
        setRecords(recentVal?.records || []);
        setTotalCount(recentVal?.totalCount ?? recentVal?.records?.length ?? 0);
        setBudget(budgetVal ?? null);
        setInsights(Array.isArray(insightsVal) ? insightsVal : []);
      } catch (err) {
        setError(err?.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [orgId]);

  const handleRunDemo = async () => {
    setDemoLoading(true);
    setDemoMessage(null);
    try {
      const res = await runDemoRequest(orgId || undefined);
      setDemoMessage(res.message || 'Demo completed. Data will appear below.');
      const results = await Promise.allSettled([
        getMonthlyTotal(orgId),
        getDailyTotals(14, orgId),
        getRecentRequests(20, 0, orgId),
        getBudget(orgId),
        getOptimizationInsights(orgId, 30),
      ]);
      const [monthlyVal, dailyVal, recentVal, budgetVal, insightsVal] = results.map((r, i) => {
        if (r.status === 'fulfilled') return r.value;
        if (i === 3) return null;
        throw r.reason;
      });
      setMonthly(monthlyVal);
      setDaily(dailyVal || []);
      setRecords(recentVal?.records || []);
      setTotalCount(recentVal?.totalCount ?? 0);
      setBudget(budgetVal ?? null);
      setInsights(Array.isArray(insightsVal) ? insightsVal : []);
    } catch (err) {
      setDemoMessage(err.response?.data?.detail || err.message || 'Demo failed');
    } finally {
      setDemoLoading(false);
    }
  };

  const chartData = daily.map((d) => ({
    date: d.date,
    co2: d.total_kg_co2eq,
    label: `${Number(d.total_kg_co2eq).toExponential(2)} kg`,
  }));

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-(--color-border) px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-text hover:text-accent transition-colors flex items-center">
            <Logo className="h-7 text-text-heading" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/estimate"
              className="text-sm text-text-muted hover:text-text"
            >
              ← Quick estimate
            </Link>
          </div>
        </div>
        <p className="text-sm text-text-muted mt-1">
          Emissions dashboard
        </p>
        <p className="text-xs text-text-muted mt-1">
          Your org ID scopes emissions to your account. Run a demo or route your app through the proxy to see data.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleRunDemo}
            disabled={demoLoading || creatingOrg || !orgId}
            className="px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {demoLoading ? 'Running…' : 'Run demo request'}
          </button>
          {demoMessage && (
            <span className="text-sm text-text-muted">{demoMessage}</span>
          )}
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-4">
            <label className="text-sm text-text-muted">Your org ID:</label>
            <input
              type="text"
              value={orgId}
              onChange={(e) => {
                const v = e.target.value;
                setOrgId(v);
                setStoredOrgId(v || '');
              }}
              placeholder={creatingOrg ? 'Creating…' : 'UUID'}
              readOnly={!!creatingOrg}
              className="bg-surface border border-(--color-border) rounded px-3 py-1.5 text-sm w-72 font-mono"
            />
          </div>
          <p className="text-xs text-text-muted max-w-xl">
            To track your app&apos;s emissions: set your OpenAI base URL to the AICo2 proxy and add header{' '}
            <code className="bg-(--color-surface-hover) px-1 rounded">X-Organization-Id: {orgId || 'your-org-id'}</code>
          </p>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error} — Is the backend running at /api?
          </div>
        )}

        {!orgId ? (
          <p className="text-text-muted">
            {creatingOrg ? 'Creating your organization…' : 'Loading…'}
          </p>
        ) : loading ? (
          <p className="text-text-muted">Loading...</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                title="Monthly CO₂"
                value={monthly}
                unit="kg"
                subtitle="Current month total"
              />
              <SummaryCard
                title="Requests"
                value={totalCount}
                unit=""
                subtitle={totalCount > 0 ? `Showing ${records?.length ?? 0} of ${totalCount}` : 'Total emission records'}
                format="number"
              />
              <SummaryCard
                title="Budget limit"
                value={budget?.monthly_limit_kg_co2eq}
                unit="kg"
                subtitle={budget ? `${budget.alert_threshold_pct}% alert` : 'Set budget — Upgrade to Pro (coming soon)'}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface rounded-xl p-5 border border-(--color-border)">
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
                  Daily CO₂ (last 14 days)
                </h2>
                <div className="w-full min-h-[256px]">
                  <ResponsiveContainer width="100%" height={256} minHeight={256}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={11} tickFormatter={(v) => v?.toExponential(0)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                        }}
                        formatter={(v) => [Number(v).toExponential(4) + ' kg', 'CO₂']}
                      />
                      <Area
                        type="monotone"
                        dataKey="co2"
                        stroke="#38bdf8"
                        fill="url(#co2Grad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                {budget ? (
                  <div className="bg-surface rounded-xl p-5 border border-(--color-border)">
                    <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
                      Budget progress
                    </h2>
                    <BudgetProgress
                      used={monthly}
                      limit={budget.monthly_limit_kg_co2eq}
                      threshold={budget.alert_threshold_pct}
                    />
                  </div>
                ) : (
                  <div className="bg-surface rounded-xl p-5 border border-(--color-border)">
                    <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
                      Carbon budget
                    </h2>
                    <p className="text-sm text-text-muted mb-3">
                      Set a monthly CO₂ budget to track and enforce limits.
                    </p>
                    <p className="text-sm text-accent font-medium mb-2">
                      Upgrade to Pro to set budget — Coming soon
                    </p>
                    <button
                      type="button"
                      onClick={() => alert('Thanks! We\'ll notify you when Pro is available.')}
                      className="mt-2 px-4 py-2 text-sm font-medium rounded-lg border border-accent text-accent hover:bg-accent/10 transition-colors"
                    >
                      Notify me when Pro is Available
                    </button>
                    <p className="text-xs text-text-muted mt-3">
                      Pro includes budget enforcement, carbon-aware routing, and optimization insights.
                    </p>
                  </div>
                )}
                <div className="bg-surface rounded-xl p-5 border border-(--color-border)">
                  <OptimizationInsights insights={insights} />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-5 border border-(--color-border)">
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">
                Request history
              </h2>
              <RequestHistoryTable records={records} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
