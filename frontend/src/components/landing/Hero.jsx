import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
          Mālama AI Carbon
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight">
          AI is growing fast. Its carbon footprint is invisible.
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] mt-6 max-w-2xl mx-auto">
          Mālama AI Carbon gives companies real-time carbon accounting, budget enforcement, and optimization for AI inference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            to="/estimate"
            className="inline-flex items-center justify-center px-8 py-3 bg-[var(--color-accent)] text-[var(--color-bg)] font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Your AI Carbon Read
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 border border-[var(--color-border)] text-[var(--color-text)] font-medium rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            View GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
