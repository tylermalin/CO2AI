import { Link } from 'react-router-dom';
import Logo from '../Logo';

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-(--color-border)">
      <div className="max-w-4xl mx-auto">
        <Logo className="h-6 text-text-heading" />
        <p className="text-text-muted text-sm mt-2">
          Building digital MRV systems for climate-aligned infrastructure.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            to="/research/ai-carbon-outlook-2026"
            className="text-sm text-accent hover:underline"
          >
            AI Carbon Outlook 2026 →
          </Link>
          <a
            href="https://drive.google.com/file/d/1ShDMUPbipZDszQrdWZbc6gHjxDkFvvP-/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            Policy Brief (PDF) →
          </a>
          <a
            href="https://malamalabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            Learn more about AICo2 →
          </a>
        </div>
      </div>
    </footer>
  );
}
