import { useState } from 'react';

const problems = [
  "Companies don't know their per-query footprint",
  "Sustainability teams cannot measure AI usage",
  "AI teams cannot optimize for carbon",
  "No standard exists for AI carbon governance",
];

const solutions = [
  "Per-request carbon accounting",
  "Organization-level emissions tracking",
  "Carbon budget enforcement",
  "Carbon-aware routing & optimization",
];

const pairs = problems.map((problem, i) => ({ problem, solution: solutions[i] ?? solutions[0] }));

const features = [
  {
    step: '01',
    title: 'Connect',
    desc: 'OpenAI-compatible proxy or API key. Switch base URL. Done.',
    icon: '→',
  },
  {
    step: '02',
    title: 'Measure',
    desc: 'FLOPs-based modeling, hardware efficiency, real-time grid intensity.',
    icon: '≈',
  },
  {
    step: '03',
    title: 'Govern',
    desc: 'Budgets. Thresholds. Route to cleaner regions. Optimize model usage.',
    icon: '◉',
  },
];

const capabilities = [
  { label: 'Carbon estimate', tag: 'per request' },
  { label: 'Routing decision', tag: 'real-time' },
  { label: 'Budget enforcement', tag: 'monitor / warn / block' },
  { label: 'ESG export', tag: 'audit-ready' },
];

export default function ProblemSolutionFeatures() {
  const [hoveredPair, setHoveredPair] = useState(null);

  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-text text-center mb-2">
          Invisible carbon. Visible control.
        </h2>
        <p className="text-text-muted text-center max-w-2xl mx-auto mb-16">
          AI inference is becoming infrastructure. Without transparency, there is no control.
        </p>

        {/* Problem → Solution pairs: alternating cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
          {pairs.map(({ problem, solution }, i) => (
            <div
              key={i}
              className="group relative"
              onMouseEnter={() => setHoveredPair(i)}
              onMouseLeave={() => setHoveredPair(null)}
            >
              <div
                className={`
                  relative overflow-hidden rounded-xl border p-6
                  transition-all duration-300 ease-out
                  ${hoveredPair === i
                    ? 'border-accent/60 bg-surface shadow-lg shadow-accent/5 scale-[1.02]'
                    : 'border-border bg-surface/50 hover:border-border/80 hover:bg-surface'
                  }
                `}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-sm font-mono font-semibold transition-colors duration-300 group-hover:bg-accent/20">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-muted text-sm line-through decoration-accent/50 transition-all duration-300 group-hover:line-through-offset-4">
                      {problem}
                    </p>
                    <p className="text-text font-medium mt-2 transition-all duration-300">
                      {solution}
                    </p>
                  </div>
                </div>
                <div
                  className={`
                    absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300
                    ${hoveredPair === i ? 'w-full' : 'w-0'}
                  `}
                />
              </div>
            </div>
          ))}
        </div>

        {/* How it works: 3 feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((f, i) => (
            <div
              key={i}
              className="
                group relative rounded-xl border border-border p-6
                bg-surface/30 hover:bg-surface
                transition-all duration-300 ease-out
                hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5
                hover:-translate-y-1
              "
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span className="text-xs font-mono text-accent/80 tracking-wider">
                {f.step}
              </span>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-2xl text-accent opacity-70 group-hover:opacity-100 transition-opacity">
                  {f.icon}
                </span>
                <h3 className="text-lg font-semibold text-text">{f.title}</h3>
              </div>
              <p className="text-text-muted text-sm mt-2 leading-relaxed">
                {f.desc}
              </p>
              <div
                className="absolute inset-0 rounded-xl ring-2 ring-accent/0 group-hover:ring-accent/20 -m-px pointer-events-none transition-all duration-300"
                aria-hidden
              />
            </div>
          ))}
        </div>

        {/* Capabilities: pill grid */}
        <div className="flex flex-wrap justify-center gap-3">
          {capabilities.map((c, i) => (
            <div
              key={i}
              className="
                px-4 py-2.5 rounded-full border border-border
                bg-surface/40 hover:bg-surface hover:border-accent/50
                transition-all duration-200
                hover:scale-105 cursor-default
              "
            >
              <span className="text-text text-sm font-medium">{c.label}</span>
              <span className="text-text-muted text-xs ml-2">{c.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
