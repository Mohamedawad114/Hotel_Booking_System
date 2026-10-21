import { useState } from 'react';
import { DestinationPicker } from '@/features/destinations/components/DestinationPicker';
import { Button } from '@/components/ui/Button';

const STARS = [1, 2, 3, 4, 5];

export function HotelSearchForm({ onSearch, initialFilters }) {
  const [destination, setDestination] = useState(null);
  const [hotelName, setHotelName] = useState(initialFilters?.hotelName || '');
  const [stars, setStars] = useState(initialFilters?.stars || null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      destinationCode: destination?.code || undefined,
      hotelName: hotelName.trim() || undefined,
      stars: stars || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-sand-100 p-5 shadow-soft md:flex-row md:items-end"
    >
      <div className="flex-1">
        <label className="mb-1.5 block text-sm font-medium text-ink-600">الوجهة</label>
        <DestinationPicker value={destination} onChange={setDestination} />
      </div>

      <div className="flex-1">
        <label className="mb-1.5 block text-sm font-medium text-ink-600">اسم الفندق</label>
        <input
          value={hotelName}
          onChange={(e) => setHotelName(e.target.value)}
          placeholder="اختياري"
          className="w-full rounded-xl border border-ink-100 bg-white px-4 py-2.5 focus:border-amber"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-600">نجوم</label>
        <div className="flex gap-1">
          {STARS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStars(stars === s ? null : s)}
              className={`h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${
                stars === s
                  ? 'border-amber bg-amber text-ink-900'
                  : 'border-ink-100 bg-white text-ink-400 hover:border-amber'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="md:self-end">
        دوّر
      </Button>
    </form>
  );
}
