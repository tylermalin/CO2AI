export default function ProbabilisticModelingSection() {
  return (
    <section className="research-section">
      <h2 className="text-xl font-medium text-text mb-4">
        Probabilistic Modeling Approach
      </h2>
      <div className="text-sm text-text-muted space-y-3 max-w-2xl">
        <p>
          Monte Carlo simulation is used to capture parameter uncertainty through
          random sampling. Rather than producing a single point estimate, the
          method generates a distribution of outcomes by repeatedly sampling
          from assumed probability distributions for each input parameter.
        </p>
        <p>
          The following parameters are treated as uncertain: tokens per company
          (normal distribution, 20% coefficient of variation), energy per 1,000
          tokens (15% CV), and grid carbon intensity (20% CV). Negative samples
          are truncated to zero.
        </p>
        <p>
          Results represent a modeled distribution of annual CO₂ emissions under
          these assumptions. The P10–P90 interval spans the 80% confidence
          range: 10% of simulated outcomes fall below P10, 10% above P90.
        </p>
        <p>
          These results are not audited operational totals. They are research
          projections intended for illustrative and policy discussion purposes.
        </p>
      </div>
    </section>
  );
}
