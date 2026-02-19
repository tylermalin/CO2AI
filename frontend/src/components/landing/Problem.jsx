export default function Problem() {
  const items = [
    'Companies don\'t know their per-query footprint',
    'Sustainability teams cannot measure AI usage',
    'AI teams cannot optimize for carbon',
    'No standard exists for AI carbon governance',
  ];

  return (
    <section className="py-16 px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-text">
          The Problem
        </h2>
        <p className="text-text-muted mt-4">
          AI inference is becoming infrastructure.
        </p>
        <p className="text-text-muted mt-2">
          But today:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside text-text-muted">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="text-text mt-6 font-medium">
          As AI scales, its energy impact becomes material.
        </p>
        <p className="text-text-muted mt-1">
          Without transparency, there is no control.
        </p>
      </div>
    </section>
  );
}
