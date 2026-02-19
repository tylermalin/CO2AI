import { Link, Outlet } from 'react-router-dom';

export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-[var(--color-text)]">
            Mālama AI Carbon — Setup
          </span>
          <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            ← Back
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8 text-sm text-[var(--color-text-muted)] space-y-1">
          <p>Step 1: Connect Provider</p>
          <p>Step 2: Activate Proxy</p>
          <p>Step 3: Set Carbon Budget</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
