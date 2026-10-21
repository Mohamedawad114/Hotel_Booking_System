import { Link } from 'react-router-dom';
import { HotelCard } from '@/features/hotel/components/HotelCard';
import { useFavorites } from '../api/useFavorites';
import { FavoriteButton } from '../components/FavoriteButton';

export default function FavoritesPage() {
  const { data: favorites = [], isLoading, isError } = useFavorites();

  return (
    <div className="min-h-screen bg-sand-200 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 font-display text-3xl text-ink-900">فنادقك المفضلة</h1>

        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-sand-300" />
            ))}
          </div>
        )}

        {isError && <p className="text-coral">معرفناش نجيب المفضلة، حاول تاني.</p>}

        {!isLoading && !isError && favorites.length === 0 && (
          <p className="text-ink-400">
            لسه مفيش فنادق في المفضلة. دوّر على فندق وحطه في المفضلة من صفحته.
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => {
            // TODO: مش مؤكد لو الـ favorite response فيه hotel كامل جواه.
            // لو مفيهوش، بنعرض كارت مبسط بـ hotelId بس مع لينك لصفحة الفندق.
            const hotel = fav.hotel;
            const hotelId = fav.hotelId || fav.hotel?.id;

            if (hotel) {
              return (
                <div key={fav.id} className="relative">
                  <HotelCard hotel={hotel} />
                  <FavoriteButton hotelId={hotelId} className="absolute right-3 top-3" />
                </div>
              );
            }

            return (
              <Link
                key={fav.id}
                to={`/hotel/${hotelId}`}
                className="flex items-center justify-between rounded-2xl border border-ink-100 bg-sand-100 p-5 shadow-soft"
              >
                <span className="text-ink-900">فندق #{hotelId}</span>
                <FavoriteButton hotelId={hotelId} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
