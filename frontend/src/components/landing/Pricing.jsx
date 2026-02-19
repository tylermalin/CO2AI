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
        <h2 className="text-2xl font-semibold text-[var(--color-text)] text-center">
          Pricing
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="border border-[var(--color-border)] rounded-lg p-6 bg-[var(--color-surface)]">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Free</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              For builders and researchers
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
              {freeFeatures.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-6">$0</p>
            <Link
              to="/estimate"
              className="mt-4 block text-center py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-sm"
            >
              Get started
            </Link>
          </article>

          <article className="border-2 border-[var(--color-accent)] rounded-lg p-6 bg-[var(--color-surface)]">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Pro</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              For growing teams
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
              {proFeatures.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-6">
              $49 <span className="text-sm font-normal text-[var(--color-text-muted)]">/ month + usage</span>
            </p>
            <Link
              to="/estimate"
              className="mt-4 block text-center py-2 bg-[var(--color-accent)] text-[var(--color-bg)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Get started
            </Link>
          </article>

          <article className="border border-[var(--color-border)] rounded-lg p-6 bg-[var(--color-surface)]">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Enterprise</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              For regulated organizations
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
              {enterpriseFeatures.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-6">
              Custom pricing
            </p>
            <Link
              to="/estimate"
              className="mt-4 block text-center py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-sm"
            >
              Contact us
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
