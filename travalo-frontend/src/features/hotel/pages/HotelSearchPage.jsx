import { useState } from 'react';
import { HotelSearchForm } from '../components/HotelSearchForm';
import { HotelCard } from '../components/HotelCard';
import { Button } from '@/components/ui/Button';
import { useHotelSearch } from '../api/useHotels';

export default function HotelSearchPage() {
  const [filters, setFilters] = useState({});
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useHotelSearch(filters);

  const hotels = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="min-h-screen bg-sand-200 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 font-display text-3xl text-ink-900">دوّر على فندقك</h1>

        <HotelSearchForm
          onSearch={(f) => {
            setFilters(f);
            setHasSearched(true);
          }}
        />

        <div className="mt-8">
          {!hasSearched && (
            <p className="text-center text-ink-400">اختار وجهتك وابدأ البحث</p>
          )}

          {isLoading && hasSearched && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-sand-300" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-center text-coral">
              {error?.message || 'معرفناش نجيب نتايج، حاول تاني'}
            </p>
          )}

          {!isLoading && !isError && hasSearched && hotels.length === 0 && (
            <p className="text-center text-ink-400">مفيش فنادق مطابقة، جرّب فلاتر مختلفة</p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                isLoading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                عرض المزيد
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
