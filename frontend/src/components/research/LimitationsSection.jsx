export default function LimitationsSection() {
  return (
    <section className="mb-16">
      <h2 className="text-xl font-medium text-[var(--color-text)] mb-4">
        Methodological Note
      </h2>
      <div className="text-sm text-[var(--color-text-muted)] space-y-3 max-w-2xl">
        <p>
          Estimates are based on scenario modeling using token usage,
          hardware efficiency assumptions (Strubell et al., 2019)<sup><a href="#ref-2" className="text-[var(--color-accent)] no-underline" aria-label="Reference 2">[2]</a></sup>,
          and global average grid carbon intensity (GHG Protocol Scope 2)<sup><a href="#ref-5" className="text-[var(--color-accent)] no-underline" aria-label="Reference 5">[5]</a></sup>.
          Results are not audited operational totals.
        </p>
        <p>
          Energy per token varies by model size, hardware, and inference configuration.
          Carbon intensity varies by region and time of day (Electricity Maps)<sup><a href="#ref-6" className="text-[var(--color-accent)] no-underline" aria-label="Reference 6">[6]</a></sup>.
          This model uses simplified assumptions for illustrative purposes.
        </p>
      </div>
    </section>
  );
}
