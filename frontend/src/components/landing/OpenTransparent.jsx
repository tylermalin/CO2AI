export default function OpenTransparent() {
  const items = [
    'Our methodology whitepaper',
    'FLOPs-based estimation logic',
    'Hardware assumptions',
    'Carbon intensity integration',
    'Uncertainty modeling',
  ];

  return (
    <section className="py-16 px-6 bg-[var(--color-surface)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Open & Transparent
        </h2>
        <p className="text-[var(--color-text-muted)] mt-4">
          We publish:
        </p>
        <ul className="mt-2 space-y-1 list-disc list-inside text-[var(--color-text-muted)]">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="text-[var(--color-text)] mt-6 font-medium">
          AI carbon accounting should be auditable.
        </p>
      </div>
    </section>
  );
}
