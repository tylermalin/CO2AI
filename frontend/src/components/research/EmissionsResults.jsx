export default function EmissionsResults({ result, optimizedCo2Kg }) {
  const baselineTonsAnnual = (result.co2Tons || 0) * 12;
  const optimizedTonsAnnual = ((optimizedCo2Kg || 0) / 1000) * 12;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Baseline (annual)</p>
        <p className="text-2xl font-semibold text-[var(--color-text)] mt-1">
          {baselineTonsAnnual.toFixed(1)} metric tons CO₂
        </p>
      </div>
      <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">After optimization (annual)</p>
        <p className="text-2xl font-semibold text-[var(--color-success)] mt-1">
          {optimizedTonsAnnual.toFixed(1)} metric tons CO₂
        </p>
      </div>
    </div>
  );
}
