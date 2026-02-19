import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[var(--color-border)]">
      <div className="max-w-4xl mx-auto">
        <p className="text-[var(--color-text)] font-medium">Mālama Labs</p>
        <p className="text-[var(--color-text-muted)] text-sm mt-2">
          Building digital MRV systems for climate-aligned infrastructure.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            to="/research/ai-carbon-outlook-2026"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            AI Carbon Outlook 2026 →
          </Link>
          <a
            href="https://malamalabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Learn more about Mālama Labs →
          </a>
        </div>
      </div>
    </footer>
  );
}
