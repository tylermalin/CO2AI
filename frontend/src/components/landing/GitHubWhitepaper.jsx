export default function GitHubWhitepaper() {
  return (
    <section className="py-16 px-6 bg-[var(--color-surface)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          GitHub + Whitepaper
        </h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-colors"
          >
            <h3 className="font-semibold text-[var(--color-text)]">Open Source Core</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              View the estimator and proxy on GitHub.
            </p>
          </a>
          <a
            href="#"
            className="block p-6 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] transition-colors"
          >
            <h3 className="font-semibold text-[var(--color-text)]">Methodology Whitepaper</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              Read the scientific basis for AI carbon measurement.
            </p>
          </a>
        </div>
        <p className="text-[var(--color-text-muted)] mt-6 text-sm">
          Transparency is a design principle.
        </p>
      </div>
    </section>
  );
}
