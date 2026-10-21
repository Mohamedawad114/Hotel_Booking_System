import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRoomFacilities } from '../api/useRooms';

export function RoomCard({ room }) {
  const [showFacilities, setShowFacilities] = useState(false);
  const { data: facilities = [], isLoading } = useRoomFacilities(room.id, showFacilities);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-sand-100 p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div>
        {/* TODO: مش متأكد اسم فيلد نوع الغرفة بالظبط (roomsType كان اسم فيلد الفلتر
            بس ممكن يبقى مختلف في الـ Room model نفسه، عدّل لو لازم) */}
        <h3 className="font-display text-lg text-ink-900">
          {room.description || room.roomsType || room.type || `غرفة ${room.code}`}
        </h3>
        {room.code && <p className="text-sm text-ink-400">كود: {room.code}</p>}

        <button
          type="button"
          onClick={() => setShowFacilities((v) => !v)}
          className="mt-2 text-sm text-ink-600 underline underline-offset-4"
        >
          {showFacilities ? 'اخفاء المرافق' : 'عرض المرافق'}
        </button>

        {showFacilities && (
          <div className="mt-2 flex flex-wrap gap-2">
            {isLoading && <span className="text-sm text-ink-400">بيحمّل...</span>}
            {!isLoading && facilities.length === 0 && (
              <span className="text-sm text-ink-400">مفيش مرافق مسجّلة للغرفة دي</span>
            )}
            {facilities.map((f) => (
              <span
                key={f.id || f.facilityCode}
                className="rounded-full bg-sand-300 px-3 py-1 text-xs text-ink-600"
              >
                {f.name || f.facilityCode}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* TODO: زرار "احجز الغرفة دي" هيتفعّل لما نبني الـ booking module
          (availability/pricing جايين من endpoint تاني: /booking/{hotelId}/searchAvailability) */}
      <Button variant="outline" disabled title="هيتفعّل مع الـ booking module">
        احجز
      </Button>
    </div>
  );
}
