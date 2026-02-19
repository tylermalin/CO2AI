import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const industries = [
  { name: 'IT Services', companies: 1171 },
  { name: 'Computer Software', companies: 1070 },
  { name: 'Higher Education', companies: 401 },
  { name: 'Internet', companies: 391 },
  { name: 'Marketing & Advertising', companies: 290 },
  { name: 'Financial Services', companies: 245 },
];

export default function AdoptionContextCharts() {
  const totalCompanies = industries.reduce((sum, i) => sum + i.companies, 0);

  return (
    <section className="research-section">
      <h2 className="text-xl font-medium text-[var(--color-text)] mb-4">
        Adoption Context
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-2xl">
        Sample of {totalCompanies.toLocaleString()} companies with material AI adoption
        (by industry). Used as baseline for scenario modeling.
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={industries} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tick={{ fill: 'var(--color-text-muted)' }} />
            <YAxis stroke="var(--color-text-muted)" fontSize={11} tick={{ fill: 'var(--color-text-muted)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
              }}
              labelStyle={{ color: 'var(--color-text)' }}
            />
            <Bar dataKey="companies" fill="#4fd1c5" name="Companies" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
