const propositions = [
  {
    title: 'Real-Time Carbon Proxy',
    content: [
      { type: 'text', value: 'Switch your API base URL.' },
      { type: 'text', value: "That's it." },
      { type: 'text', value: 'Your AI traffic flows through AICo2.' },
      { type: 'label', value: 'We attach:' },
      {
        type: 'list',
        items: [
          'Carbon estimate',
          'Routing decision',
          'Optimization suggestions',
          'Budget status',
        ],
      },
      { type: 'highlight', value: 'No changes to your application logic.' },
    ],
  },
  {
    title: 'Carbon Governance',
    content: [
      { type: 'text', value: 'Treat carbon like cost.' },
      { type: 'text', value: 'Set monthly CO₂ limits.' },
      { type: 'label', value: 'Choose:' },
      {
        type: 'list',
        items: ['Monitor mode', 'Soft warnings', 'Hard enforcement'],
      },
      { type: 'text', value: 'Track usage across teams.' },
      { type: 'text', value: 'Export ESG-ready reports.' },
    ],
  },
  {
    title: 'Carbon-Aware Routing',
    content: [
      { type: 'text', value: 'AI inference does not have to be static.' },
      { type: 'label', value: 'AICo2 evaluates:' },
      {
        type: 'list',
        items: [
          'Real-time grid carbon intensity',
          'Estimated emissions per region',
          'Model energy footprint',
        ],
      },
      {
        type: 'text',
        value: 'Then routes requests to the lowest-carbon available region.',
      },
      { type: 'highlight', value: 'AI can become demand-responsive infrastructure.' },
    ],
  },
  {
    title: 'Open & Transparent',
    content: [
      { type: 'label', value: 'We publish:' },
      {
        type: 'list',
        items: [
          'Our methodology whitepaper',
          'FLOPs-based estimation logic',
          'Hardware assumptions',
          'Carbon intensity integration',
          'Uncertainty modeling',
        ],
      },
      { type: 'highlight', value: 'AI carbon accounting should be auditable.' },
    ],
  },
];

export default function ValuePropositions() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {propositions.map((prop, i) => (
            <div
              key={i}
              className="group rounded-xl border border-border bg-surface/30 hover:bg-surface p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <h2 className="text-xl font-semibold text-text mb-4 transition-colors duration-200 group-hover:text-accent/90">
                {prop.title}
              </h2>
              <div className="space-y-2 text-sm">
                {prop.content.map((block, j) => {
                  if (block.type === 'text') {
                    return (
                      <p key={j} className="text-text-muted">
                        {block.value}
                      </p>
                    );
                  }
                  if (block.type === 'label') {
                    return (
                      <p key={j} className="text-text-muted font-medium mt-2">
                        {block.value}
                      </p>
                    );
                  }
                  if (block.type === 'list') {
                    return (
                      <ul key={j} className="list-disc list-inside text-text-muted space-y-1 ml-1">
                        {block.items.map((item, k) => (
                          <li key={k}>{item}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.type === 'highlight') {
                    return (
                      <p key={j} className="text-text font-medium mt-3">
                        {block.value}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
