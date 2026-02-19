export default function GitHubWhitepaper() {
  return (
    <section className="py-16 px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-text">
          GitHub + Whitepaper
        </h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <a
            href="https://github.com/tylermalin/CO2AI"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 border border-(--color-border) rounded-lg hover:border-accent hover:bg-(--color-surface-hover) hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <h3 className="font-semibold text-text">Open Source Core</h3>
            <p className="text-sm text-text-muted mt-2">
              View the estimator and proxy on GitHub.
            </p>
          </a>
          <a
            href="https://drive.google.com/file/d/1ShDMUPbipZDszQrdWZbc6gHjxDkFvvP-/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 border border-(--color-border) rounded-lg hover:border-accent hover:bg-(--color-surface-hover) hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <h3 className="font-semibold text-text">Methodology Whitepaper</h3>
            <p className="text-sm text-text-muted mt-2">
              Read the scientific basis for AI carbon measurement.
            </p>
          </a>
        </div>
        <p className="text-text-muted mt-6 text-sm">
          Transparency is a design principle.
        </p>
      </div>
    </section>
  );
}
