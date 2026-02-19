import { Link } from 'react-router-dom';

export default function Pricing() {
  const freeFeatures = [
    'Instant carbon estimate tool',
    'Open-source GitHub access',
    'Public documentation',
    'Local proxy mode',
  ];

  const proFeatures = [
    'Hosted proxy',
    'Real-time carbon tracking',
    'Budget enforcement',
    'Carbon-aware routing',
    'Optimization insights',
    'Basic ESG export',
  ];

  const enterpriseFeatures = [
    'Multi-tenant org support',
    'SSO',
    'Audit logs',
    'Signed emissions ledger',
    'Custom routing policies',
    'Dedicated support',
    'Custom reporting',
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-text text-center">
          Pricing
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="border border-(--color-border) rounded-lg p-6 bg-surface shadow-sm hover:shadow-md hover:border-(--color-border)/80 transition-all duration-300">
            <h3 className="text-lg font-semibold text-text">Free</h3>
            <p className="text-sm text-text-muted mt-1">
              For builders and researchers
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-muted">
              {freeFeatures.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
            <p className="text-2xl font-bold text-text mt-6">$0</p>
            <Link
              to="/estimate"
              className="mt-4 block text-center py-2 border border-(--color-border) text-text rounded-lg hover:bg-(--color-surface-hover) transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              Start Your Project
            </Link>
          </article>

          <article className="border-2 border-accent rounded-lg p-6 bg-surface ring-2 ring-accent/20 shadow-md hover:shadow-lg hover:ring-accent/30 transition-all duration-300">
            <h3 className="text-lg font-semibold text-text">Pro</h3>
            <p className="text-sm text-text-muted mt-1">
              For growing teams
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-muted">
              {proFeatures.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
            <p className="text-2xl font-bold text-text mt-6">
              $49 <span className="text-sm font-normal text-text-muted">/ month + usage</span>
            </p>
            <Link
              to="/estimate"
              className="mt-4 block text-center py-2 bg-accent text-bg rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Start Your Project
            </Link>
          </article>

          <article className="border border-(--color-border) rounded-lg p-6 bg-surface shadow-sm hover:shadow-md hover:border-(--color-border)/80 transition-all duration-300">
            <h3 className="text-lg font-semibold text-text">Enterprise</h3>
            <p className="text-sm text-text-muted mt-1">
              For regulated organizations
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-muted">
              {enterpriseFeatures.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
            <p className="text-2xl font-bold text-text mt-6">
              Custom pricing
            </p>
            <Link
              to="/estimate"
              className="mt-4 block text-center py-2 border border-(--color-border) text-text rounded-lg hover:bg-(--color-surface-hover) transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              Contact us
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
