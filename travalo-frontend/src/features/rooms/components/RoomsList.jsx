import { useState } from 'react';
import { GuestSelector } from './GuestSelector';
import { RoomCard } from './RoomCard';
import { Button } from '@/components/ui/Button';
import { useHotelRooms } from '../api/useRooms';

export function RoomsList({ hotelId }) {
  const [guests, setGuests] = useState({ adults: 2, children: 0 });

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useHotelRooms(hotelId, guests);

  const rooms = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="font-display text-xl text-ink-900">الغرف المتاحة</h2>
        <GuestSelector
          adults={guests.adults}
          children={guests.children}
          onChange={setGuests}
        />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-sand-300" />
          ))}
        </div>
      )}

      {isError && <p className="text-coral">معرفناش نجيب الغرف المتاحة، حاول تاني.</p>}

      {!isLoading && !isError && rooms.length === 0 && (
        <p className="text-ink-400">مفيش غرف متاحة بالعدد ده حاليًا.</p>
      )}

      <div className="flex flex-col gap-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" isLoading={isFetchingNextPage} onClick={() => fetchNextPage()}>
            عرض المزيد
          </Button>
        </div>
      )}
    </div>
  );
}
