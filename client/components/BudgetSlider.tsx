/* Spruce — the budget slider (the core control). A styled track + fill + knob,
   driven by a real (accessible, keyboard-able) range input overlaid on top. */
type Props = { min: number; max: number; value: number; step?: number; onChange: (n: number) => void };

export function BudgetSlider({ min, max, value, step = 10, onChange }: Props) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="slider" style={{ position: 'relative' }}>
      <div className="fill" style={{ width: `${pct}%` }} />
      <div className="knob" style={{ left: `${pct}%` }} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Budget"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }}
      />
    </div>
  );
}
