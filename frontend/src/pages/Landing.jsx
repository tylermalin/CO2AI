import { Link } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import Problem from '../components/landing/Problem';
import Solution from '../components/landing/Solution';
import HowItWorks from '../components/landing/HowItWorks';
import CarbonProxy from '../components/landing/CarbonProxy';
import Governance from '../components/landing/Governance';
import Routing from '../components/landing/Routing';
import OpenTransparent from '../components/landing/OpenTransparent';
import Pricing from '../components/landing/Pricing';
import GitHubWhitepaper from '../components/landing/GitHubWhitepaper';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <nav className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
            Mālama AI Carbon
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/estimate"
              className="text-sm text-[var(--color-accent)] font-medium hover:underline"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <CarbonProxy />
        <Governance />
        <Routing />
        <OpenTransparent />
        <Pricing />
        <GitHubWhitepaper />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}
