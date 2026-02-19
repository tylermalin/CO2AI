import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm uppercase tracking-widest text-accent mb-4">
          a mālama labs project
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-text leading-tight">
          AI is growing fast. Its carbon footprint is invisible.
        </h1>
        <p className="text-lg text-text-muted mt-6 max-w-2xl mx-auto">
          AICo2 gives companies real-time carbon accounting, budget enforcement, and optimization for AI inference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            to="/estimate"
            className="inline-flex items-center justify-center px-8 py-3 bg-accent text-bg font-medium rounded-lg hover:opacity-90 duration-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Get Your AI Carbon Read
          </Link>
          <a
            href="https://github.com/tylermalin/CO2AI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 border border-(--color-border) text-text font-medium rounded-lg hover:bg-(--color-surface-hover) hover:border-accent/50 duration-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            View GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
