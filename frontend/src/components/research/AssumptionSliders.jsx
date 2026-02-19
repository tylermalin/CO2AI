function Slider({ label, value, min, max, step, format, onChange }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-1">
        <label className="text-text-muted">{label}</label>
        <span className="text-text font-mono">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-(--color-surface-hover) rounded-lg appearance-none cursor-pointer accent-accent"
      />
    </div>
  );
}

export default function AssumptionSliders({
  tokensPerCompany,
  setTokensPerCompany,
  whPerThousand,
  setWhPerThousand,
  carbonIntensity,
  setCarbonIntensity,
  routingReduction,
  setRoutingReduction,
}) {
  return (
    <div className="space-y-2">
      <Slider
        label="Monthly tokens per company"
        value={tokensPerCompany}
        min={5_000_000}
        max={100_000_000}
        step={5_000_000}
        format={(v) => `${(v / 1e6).toFixed(0)}M`}
        onChange={setTokensPerCompany}
      />
      <Slider
        label="Energy (Wh per 1k tokens)"
        value={whPerThousand}
        min={0.2}
        max={1}
        step={0.05}
        format={(v) => `${v} Wh`}
        onChange={setWhPerThousand}
      />
      <Slider
        label="Carbon intensity (kg CO₂/kWh)"
        value={carbonIntensity}
        min={0.1}
        max={0.8}
        step={0.05}
        format={(v) => `${v} kg`}
        onChange={setCarbonIntensity}
      />
      <Slider
        label="Carbon-aware routing reduction"
        value={routingReduction}
        min={0}
        max={50}
        step={5}
        format={(v) => `${v}%`}
        onChange={setRoutingReduction}
      />
    </div>
  );
}
