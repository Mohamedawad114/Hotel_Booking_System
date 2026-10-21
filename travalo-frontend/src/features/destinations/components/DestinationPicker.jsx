import { useMemo, useRef, useState } from 'react';
import { useDestinations } from '../api/useDestinations';

// TODO: أسماء الفيلدات هنا (name, code, countryName) مفترضة، عدّلها
// لما يتأكد شكل الـ DestinationDto الحقيقي.
function getDestinationLabel(destination) {
  return destination.name || destination.city || destination.code || 'وجهة غير معروفة';
}
function getDestinationSubLabel(destination) {
  return destination.countryName || destination.country || '';
}

export function DestinationPicker({ value, onChange, placeholder = 'فين هتسافر؟' }) {
  const { data: destinations = [], isLoading } = useDestinations();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return destinations.slice(0, 8);
    const q = query.trim().toLowerCase();
    return destinations
      .filter(
        (d) =>
          getDestinationLabel(d).toLowerCase().includes(q) ||
          getDestinationSubLabel(d).toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [destinations, query]);

  const handleSelect = (destination) => {
    onChange?.(destination);
    setQuery(getDestinationLabel(destination));
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        value={value ? getDestinationLabel(value) : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange?.(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink-100 bg-sand-100 px-4 py-2.5 text-ink placeholder:text-ink-400/60 focus:border-amber focus:bg-white"
      />

      {open && (
        <div className="absolute z-10 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-ink-100 bg-white shadow-soft">
          {isLoading && <div className="p-4 text-sm text-ink-400">بنحمّل الوجهات...</div>}
          {!isLoading && filtered.length === 0 && (
            <div className="p-4 text-sm text-ink-400">مفيش نتايج</div>
          )}
          {filtered.map((d) => (
            <button
              key={d.id || d.code}
              type="button"
              onMouseDown={() => handleSelect(d)}
              className="flex w-full flex-col items-start px-4 py-2.5 text-start hover:bg-sand-200"
            >
              <span className="text-sm font-medium text-ink-900">{getDestinationLabel(d)}</span>
              {getDestinationSubLabel(d) && (
                <span className="text-xs text-ink-400">{getDestinationSubLabel(d)}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
