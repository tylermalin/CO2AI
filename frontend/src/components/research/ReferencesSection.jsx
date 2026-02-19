export default function ReferencesSection() {
  const refs = [
    { id: 1, text: 'Henderson et al., 2020, JMLR. Towards the Systematic Reporting of the Energy and Carbon Footprints of Machine Learning.' },
    { id: 2, text: 'Strubell et al., 2019, ACL. Energy and Policy Considerations for Deep Learning in NLP.' },
    { id: 3, text: 'Patterson et al., 2021, arXiv. Carbon Emissions and Large Neural Network Training.' },
    { id: 4, text: 'Green Software Foundation. SCI Specification.' },
    { id: 5, text: 'GHG Protocol Scope 2 Guidance.' },
    { id: 6, text: 'Electricity Maps API documentation.' },
  ];

  return (
    <section className="research-section" aria-labelledby="references-heading">
      <h2 id="references-heading" className="text-xl font-medium text-[var(--color-text)] mb-4">
        References
      </h2>
      <ol className="text-xs text-[var(--color-text-muted)] space-y-2 max-w-2xl list-decimal list-inside">
        {refs.map((r) => (
          <li key={r.id} id={`ref-${r.id}`}>
            {r.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
