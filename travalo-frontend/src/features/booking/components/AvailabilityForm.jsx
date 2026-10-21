import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function AvailabilityForm({ onSearch, isLoading }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState([]);

  const handleChildrenChange = (value) => {
    const n = Math.max(0, value);
    setChildren(n);
    setChildrenAges((prev) => {
      const next = [...prev];
      next.length = n;
      return next.map((age) => age ?? 5);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    onSearch({
      checkIn,
      checkOut,
      adults,
      children,
      childrenAges: children > 0 ? childrenAges.map((age) => ({ age })) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-sand-100 p-5 shadow-soft">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="تاريخ الوصول"
          type="date"
          min={todayISO()}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
        <Input
          label="تاريخ المغادرة"
          type="date"
          min={checkIn || todayISO()}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="بالغين"
          type="number"
          min={1}
          value={adults}
          onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
        />
        <Input
          label="أطفال"
          type="number"
          min={0}
          value={children}
          onChange={(e) => handleChildrenChange(Number(e.target.value))}
        />
      </div>

      {children > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {childrenAges.map((age, i) => (
            <Input
              key={i}
              label={`عمر الطفل ${i + 1}`}
              type="number"
              min={0}
              max={17}
              value={age}
              onChange={(e) => {
                const next = [...childrenAges];
                next[i] = Number(e.target.value);
                setChildrenAges(next);
              }}
            />
          ))}
        </div>
      )}

      <Button type="submit" isLoading={isLoading}>
        دوّر على الغرف المتاحة
      </Button>
    </form>
  );
}
