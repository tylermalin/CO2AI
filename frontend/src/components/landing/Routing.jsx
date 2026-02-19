export default function Routing() {
  const factors = [
    'Real-time grid carbon intensity',
    'Estimated emissions per region',
    'Model energy footprint',
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Carbon-Aware Routing
        </h2>
        <p className="text-[var(--color-text-muted)] mt-4">
          AI inference does not have to be static.
        </p>
        <p className="text-[var(--color-text-muted)] mt-2">
          Mālama AI Carbon evaluates:
        </p>
        <ul className="mt-2 space-y-1 list-disc list-inside text-[var(--color-text-muted)]">
          {factors.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <p className="text-[var(--color-text-muted)] mt-4">
          Then routes requests to the lowest-carbon available region.
        </p>
        <p className="text-[var(--color-text)] mt-4 font-medium">
          AI can become demand-responsive infrastructure.
        </p>
      </div>
    </section>
  );
}
