import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function IndustryBreakdownChart({ data }) {
  return (
    <section className="research-section">
      <h2 className="text-xl font-medium text-text mb-4">
        Industry Breakdown (Annual)
      </h2>
      <div className="w-full min-h-[320px]">
        <ResponsiveContainer width="100%" height={320} minHeight={320}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              stroke="var(--color-text-muted)"
              fontSize={11}
              tick={{ fill: 'var(--color-text-muted)' }}
              angle={-35}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              fontSize={11}
              tick={{ fill: 'var(--color-text-muted)' }}
              tickFormatter={(v) => `${v.toFixed(0)} t`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
              }}
              formatter={(v) => [`${Number(v).toFixed(1)} metric tons CO₂`, 'Annual']}
            />
            <Bar dataKey="co2Tons" fill="#4fd1c5" name="CO₂ (tons)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
