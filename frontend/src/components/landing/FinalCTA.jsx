import { Link } from 'react-router-dom';

export default function FinalCTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-text text-lg">
          AI is becoming critical infrastructure.
        </p>
        <p className="text-text-muted mt-2">
          It should be measurable, governable, and optimizable.
        </p>
        <p className="text-text-muted mt-2">
          Start with a carbon read today.
        </p>
        <Link
          to="/estimate"
          className="inline-flex items-center justify-center px-8 py-3 mt-8 bg-accent text-bg font-medium rounded-lg hover:opacity-90 duration-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start Your Project
        </Link>
      </div>
    </section>
  );
}
