function Counter({ label, value, onChange, min = 0 }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-ink-600">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-100 text-ink-600 hover:border-amber disabled:opacity-40"
          disabled={value <= min}
        >
          −
        </button>
        <span className="w-4 text-center text-sm font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-100 text-ink-600 hover:border-amber"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function GuestSelector({ adults, children, onChange }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-white p-4 sm:min-w-[220px]">
      <Counter label="بالغين" value={adults} min={1} onChange={(v) => onChange({ adults: v, children })} />
      <Counter label="أطفال" value={children} onChange={(v) => onChange({ adults, children: v })} />
    </div>
  );
}
