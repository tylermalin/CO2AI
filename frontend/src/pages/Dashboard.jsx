import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getMonthlyTotal,
  getDailyTotals,
  getRecentRequests,
  getBudget,
  getOptimizationInsights,
} from '../api';
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
    <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
      <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-semibold text-[var(--color-text)] mt-1">
        {displayValue} {unit}
      </p>
      {subtitle && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtitle}</p>
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
        <span className="text-[var(--color-text-muted)]">Budget used</span>
        <span className={isOver ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)]'}>
          {used?.toExponential(3) ?? '—'} / {limit?.toExponential(3) ?? '—'} kg
        </span>
      </div>
      <div className="h-3 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isOver ? 'bg-[var(--color-danger)]' : isWarning ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-accent)]'
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
      <p className="text-[var(--color-text-muted)] text-sm py-8 text-center">
        No requests yet
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
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
              className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
            >
              <td className="py-2 px-2 font-mono text-xs">{r.model}</td>
              <td className="py-2 px-2">{r.input_tokens + r.output_tokens}</td>
              <td className="py-2 px-2">{r.carbon_kg_co2eq?.toExponential(3) ?? '—'}</td>
              <td className="py-2 px-2 text-xs">{r.routing_region ?? '—'}</td>
              <td className="py-2 px-2 text-xs text-[var(--color-text-muted)]">
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
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
          Optimization insights
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">No insights yet. Run some requests to get suggestions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
        Optimization insights
      </h3>
      <ul className="space-y-2">
        {insights.map((i, idx) => (
          <li
            key={idx}
            className={`text-sm p-3 rounded-lg ${categoryStyles[i.category] || 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'}`}
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
  const [orgId, setOrgId] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [monthlyVal, dailyVal, recentVal, budgetVal, insightsVal] = await Promise.all([
          getMonthlyTotal(orgId || null),
          getDailyTotals(14, orgId || null),
          getRecentRequests(20, 0, orgId || null),
          orgId ? getBudget(orgId) : Promise.resolve(null),
          getOptimizationInsights(orgId || null, 30),
        ]);
        setMonthly(monthlyVal);
        setDaily(dailyVal || []);
        setRecords(recentVal.records || []);
        setTotalCount(recentVal.totalCount ?? 0);
        setBudget(budgetVal);
        setInsights(insightsVal);
      } catch (err) {
        setError(err.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [orgId]);

  const chartData = daily.map((d) => ({
    date: d.date,
    co2: d.total_kg_co2eq,
    label: `${Number(d.total_kg_co2eq).toExponential(2)} kg`,
  }));

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
            Mālama AI Carbon
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/estimate"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              ← Quick estimate
            </Link>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Emissions dashboard
        </p>
        <div className="mt-3 flex items-center gap-4">
          <label className="text-sm text-[var(--color-text-muted)]">
            Org ID (optional):
          </label>
          <input
            type="text"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            placeholder="UUID for org-scoped data"
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-1.5 text-sm w-72"
          />
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error} — Is the backend running at /api?
          </div>
        )}

        {loading ? (
          <p className="text-[var(--color-text-muted)]">Loading...</p>
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
                subtitle={budget ? `${budget.alert_threshold_pct}% alert` : 'No budget set'}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
                <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
                  Daily CO₂ (last 14 days)
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
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
                {budget && (
                  <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
                    <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
                      Budget progress
                    </h2>
                    <BudgetProgress
                      used={monthly}
                      limit={budget.monthly_limit_kg_co2eq}
                      threshold={budget.alert_threshold_pct}
                    />
                  </div>
                )}
                <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
                  <OptimizationInsights insights={insights} />
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
              <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
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
