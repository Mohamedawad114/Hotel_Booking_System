import { Link } from 'react-router-dom';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 text-amber">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'opacity-100' : 'opacity-20'}>
          ★
        </span>
      ))}
    </div>
  );
}

export function HotelCard({ hotel }) {
  const image = hotel.images?.[0];

  return (
    <Link
      to={`/hotel/${hotel.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-sand-100 shadow-soft transition-transform hover:-translate-y-1"
    >
      <div className="relative h-44 w-full overflow-hidden bg-sand-300">
        {image ? (
          <img
            src={image}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-400">مفيش صورة</div>
        )}
        <FavoriteButton hotelId={hotel.id} className="absolute right-3 top-3 h-8 w-8" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight text-ink-900">{hotel.name}</h3>
          {hotel.ranking != null && (
            <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-sand-100">
              {hotel.ranking.toFixed?.(1) ?? hotel.ranking}
            </span>
          )}
        </div>

        <p className="text-sm text-ink-400">{hotel.city}</p>

        {hotel.rating != null && <StarRating rating={hotel.rating} />}

        {hotel.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-600">{hotel.description}</p>
        )}
      </div>
    </Link>
  );
}
