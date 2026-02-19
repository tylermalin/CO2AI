export default function Solution() {
  const items = [
    'Per-request carbon accounting',
    'Organization-level emissions tracking',
    'Carbon budget enforcement',
    'Carbon-aware routing',
    'Optimization insights',
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-text">
          The Solution
        </h2>
        <p className="text-text-muted mt-4">
          AICo2 is a drop-in carbon intelligence layer for AI systems.
        </p>
        <p className="text-text-muted mt-2">
          It provides:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside text-text-muted">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="text-text mt-6">
          All built on a transparent, research-backed methodology.
        </p>
      </div>
    </section>
  );
}
