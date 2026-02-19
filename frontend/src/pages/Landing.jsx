import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Hero from '../components/landing/Hero';
import ProblemSolutionFeatures from '../components/landing/ProblemSolutionFeatures';
import ValuePropositions from '../components/landing/ValuePropositions';
import Pricing from '../components/landing/Pricing';
import GitHubWhitepaper from '../components/landing/GitHubWhitepaper';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <nav className="sticky top-0 z-10 border-b border-(--color-border) bg-bg/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold text-text hover:text-accent duration-200 transition-colors flex items-center group">
            <Logo className="h-7 text-text group-hover:text-accent transition-colors duration-200" />
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-sm text-text-muted hover:text-text transition-colors duration-200 relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-200 hover:after:w-full"
            >
              Sign In
            </Link>
            <Link
              to="/estimate"
              className="text-sm text-accent font-medium hover:opacity-90 transition-opacity duration-200"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <ProblemSolutionFeatures />
        <ValuePropositions />
        <Pricing />
        <GitHubWhitepaper />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}
