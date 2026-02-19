export default function Governance() {
  return (
    <section className="py-16 px-6 bg-[var(--color-surface)]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Carbon Governance
        </h2>
        <p className="text-[var(--color-text-muted)] mt-4">
          Treat carbon like cost.
        </p>
        <p className="text-[var(--color-text-muted)] mt-2">
          Set monthly CO₂ limits.
        </p>
        <p className="text-[var(--color-text-muted)] mt-2">
          Choose:
        </p>
        <ul className="mt-2 space-y-1 list-disc list-inside text-[var(--color-text-muted)]">
          <li>Monitor mode</li>
          <li>Soft warnings</li>
          <li>Hard enforcement</li>
        </ul>
        <p className="text-[var(--color-text-muted)] mt-4">
          Track usage across teams.
        </p>
        <p className="text-[var(--color-text-muted)]">
          Export ESG-ready reports.
        </p>
      </div>
    </section>
  );
}
