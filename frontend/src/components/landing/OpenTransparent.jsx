export default function OpenTransparent() {
  const items = [
    'Our methodology whitepaper',
    'FLOPs-based estimation logic',
    'Hardware assumptions',
    'Carbon intensity integration',
    'Uncertainty modeling',
  ];

  return (
    <section className="py-16 px-6 bg-surface">
      <div className="max-w-4xl mx-auto group">
        <h2 className="text-2xl font-semibold text-text transition-colors duration-200 group-hover:text-accent/90">
          Open & Transparent
        </h2>
        <p className="text-text-muted mt-4">
          We publish:
        </p>
        <ul className="mt-2 space-y-1 list-disc list-inside text-text-muted">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="text-text mt-6 font-medium">
          AI carbon accounting should be auditable.
        </p>
      </div>
    </section>
  );
}
