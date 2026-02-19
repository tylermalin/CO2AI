import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function OptimizationImpactChart({ baselineTons, optimizedTons }) {
  const data = [
    { name: 'Baseline', value: baselineTons, fill: '#94a3b8' },
    { name: 'With routing', value: optimizedTons, fill: '#4ade80' },
  ];

  return (
    <section className="research-section">
      <h2 className="text-xl font-medium text-[var(--color-text)] mb-4">
        Optimization Impact
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-2xl">
        Annual emissions: baseline vs. carbon-aware routing applied.
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 60, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis type="number" stroke="var(--color-text-muted)" fontSize={11} tick={{ fill: 'var(--color-text-muted)' }} tickFormatter={(v) => `${v.toFixed(0)} t`} />
            <YAxis type="category" dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tick={{ fill: 'var(--color-text-muted)' }} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
              }}
              formatter={(v) => [`${Number(v).toFixed(1)} metric tons CO₂`, 'Annual']}
            />
            <Bar dataKey="value" name="Annual CO₂" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
