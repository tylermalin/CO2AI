import { Link, Outlet } from 'react-router-dom';
import Logo from '../../components/Logo';

export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-(--color-border) px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-text">
            <Logo className="h-6 text-text-heading" /> — Setup
          </span>
          <Link to="/" className="text-sm text-text-muted hover:text-text">
            ← Back
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8 text-sm text-text-muted space-y-1">
          <p>Step 1: Connect Provider</p>
          <p>Step 2: Activate Proxy</p>
          <p>Step 3: Set Carbon Budget</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
