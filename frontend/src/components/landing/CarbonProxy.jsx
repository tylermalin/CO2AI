export default function CarbonProxy() {
  const features = [
    'Carbon estimate',
    'Routing decision',
    'Optimization suggestions',
    'Budget status',
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto group">
        <h2 className="text-2xl font-semibold text-text transition-colors duration-200 group-hover:text-accent/90">
          Real-Time Carbon Proxy
        </h2>
        <p className="text-xl text-text-muted mt-4">
          Switch your API base URL.
        </p>
        <p className="text-xl text-text-muted">
          That&apos;s it.
        </p>
        <p className="text-text-muted mt-4">
          Your AI traffic flows through AICo2.
        </p>
        <p className="text-text-muted mt-2">
          We attach:
        </p>
        <ul className="mt-2 space-y-1 list-disc list-inside text-text-muted">
          {features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <p className="text-text mt-6 font-medium">
          No changes to your application logic.
        </p>
      </div>
    </section>
  );
}
