import { useState, useEffect } from 'react';
import {
  getMonthlyTotal,
  getDailyTotals,
  getRecentRequests,
  getBudget,
} from './api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function SummaryCard({ title, value, unit, subtitle }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
      <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-semibold text-[var(--color-text)] mt-1">
        {value != null ? value.toExponential(3) : '—'} {unit}
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

function OptimizationInsights({ monthly, daily, budget }) {
  const insights = [];

  if (monthly != null && monthly > 0) {
    const avgDaily = daily?.length ? daily.reduce((s, d) => s + d.total_kg_co2eq, 0) / daily.length : 0;
    if (avgDaily > 0 && monthly / 30 > avgDaily * 1.2) {
      insights.push({
        type: 'warning',
        text: 'Recent days show higher emissions than monthly average. Consider using optimize routing mode.',
      });
    }
  }

  if (budget && budget.monthly_limit_kg_co2eq > 0) {
    const used = monthly ?? 0;
    const pct = (used / budget.monthly_limit_kg_co2eq) * 100;
    if (pct >= budget.alert_threshold_pct) {
      insights.push({
        type: 'warning',
        text: `Budget at ${pct.toFixed(0)}% of limit. Enable hard_block to prevent overruns.`,
      });
    }
    if (pct < 50 && monthly > 0) {
      insights.push({
        type: 'success',
        text: 'Emissions well under budget. Consider lowering limit or increasing usage.',
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'info',
      text: 'Use X-Routing-Mode: optimize to route requests to lowest-carbon regions.',
    });
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
            className={`text-sm p-3 rounded-lg ${
              i.type === 'warning'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : i.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
            }`}
          >
            {i.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const [monthly, setMonthly] = useState(null);
  const [daily, setDaily] = useState([]);
  const [records, setRecords] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orgId, setOrgId] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [monthlyVal, dailyVal, recordsVal, budgetVal] = await Promise.all([
          getMonthlyTotal(orgId || null),
          getDailyTotals(14, orgId || null),
          getRecentRequests(20, orgId || null),
          orgId ? getBudget(orgId) : Promise.resolve(null),
        ]);
        setMonthly(monthlyVal);
        setDaily(dailyVal || []);
        setRecords(recordsVal || []);
        setBudget(budgetVal);
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
        <h1 className="text-xl font-bold">AI Carbon Control Plane</h1>
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
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                title="Monthly CO₂"
                value={monthly}
                unit="kg"
                subtitle="Current month total"
              />
              <SummaryCard
                title="Requests (recent)"
                value={records?.length}
                unit=""
                subtitle="Last 20 requests"
              />
              <SummaryCard
                title="Budget limit"
                value={budget?.monthly_limit_kg_co2eq}
                unit="kg"
                subtitle={budget ? `${budget.alert_threshold_pct}% alert` : 'No budget set'}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily CO₂ chart */}
              <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
                <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
                  Daily CO₂ (last 14 days)
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
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
                        stroke="var(--color-accent)"
                        fill="url(#co2Grad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Budget + Insights */}
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
                  <OptimizationInsights monthly={monthly} daily={daily} budget={budget} />
                </div>
              </div>
            </div>

            {/* Request history */}
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
