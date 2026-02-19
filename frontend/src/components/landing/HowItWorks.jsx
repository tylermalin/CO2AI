export default function HowItWorks() {
  const steps = [
    {
      title: 'Connect',
      description: 'Use our OpenAI-compatible proxy or connect your API key.',
    },
    {
      title: 'Measure',
      description: 'We estimate energy and CO₂ per query using FLOPs-based modeling, hardware efficiency assumptions, and real-time grid carbon intensity.',
    },
    {
      title: 'Govern',
      description: 'Set budgets. Enforce thresholds. Route to cleaner regions. Optimize model usage.',
    },
  ];

  return (
    <section className="py-16 px-6 bg-[var(--color-surface)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          How It Works
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="border border-[var(--color-border)] rounded-lg p-6">
              <span className="text-sm font-medium text-[var(--color-accent)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mt-2">
                {step.title}
              </h3>
              <p className="text-[var(--color-text-muted)] mt-2 text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
