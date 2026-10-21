import { useParams, useNavigate } from 'react-router-dom';
import { useHotelDetails, useHotelFacilities } from '../api/useHotels';
import { RoomsList } from '@/features/rooms/components/RoomsList';
import { ReviewsList } from '@/features/reviews/components/ReviewsList';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { Button } from '@/components/ui/Button';

export default function HotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: hotel, isLoading, isError } = useHotelDetails(id);
  const { data: facilities = [] } = useHotelFacilities(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-200">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  if (isError || !hotel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-sand-200">
        <p className="text-ink-400">معرفناش نجيب بيانات الفندق</p>
        <button onClick={() => navigate(-1)} className="text-ink-900 underline underline-offset-4">
          ارجع
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-200 pb-16">
      {/* معرض الصور */}
      <div className="relative grid h-72 grid-cols-4 gap-1 sm:h-96">
        {(hotel.images?.length ? hotel.images : [null]).slice(0, 4).map((img, i) => (
          <div
            key={i}
            className={`overflow-hidden bg-sand-300 ${i === 0 ? 'col-span-4 sm:col-span-2 sm:row-span-2' : 'hidden sm:block'}`}
          >
            {img && <img src={img} alt={hotel.name} className="h-full w-full object-cover" />}
          </div>
        ))}
        <FavoriteButton hotelId={Number(id)} className="absolute right-4 top-4" />
      </div>

      <div className="mx-auto -mt-8 max-w-4xl rounded-t-2xl bg-sand-100 px-6 py-8 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-ink-900">{hotel.name}</h1>
            <p className="mt-1 text-ink-400">{hotel.address || hotel.city}</p>
          </div>
          {hotel.rating != null && (
            <div className="flex shrink-0 gap-0.5 text-lg text-amber">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < hotel.rating ? 'opacity-100' : 'opacity-20'}>
                  ★
                </span>
              ))}
            </div>
          )}
        </div>

        {hotel.description && (
          <p className="mb-6 leading-relaxed text-ink-600">{hotel.description}</p>
        )}

        <Button onClick={() => navigate(`/hotel/${id}/book`)} className="mb-6">
          احجز دلوقتي
        </Button>

        {facilities.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 font-display text-xl text-ink-900">المرافق</h2>
            <div className="flex flex-wrap gap-2">
              {facilities.map((f) => (
                <span
                  key={f.id || f.facilityCode}
                  className="rounded-full bg-sand-300 px-3 py-1.5 text-sm text-ink-600"
                >
                  {/* TODO: مش متأكد اسم الفيلد بالظبط، عدّل لو مختلف */}
                  {f.name || f.facilityCode}
                </span>
              ))}
            </div>
          </div>
        )}

        {hotel.phones?.length > 0 && (
          <div>
            <h2 className="mb-2 font-display text-xl text-ink-900">تواصل</h2>
            {hotel.phones.map((p) => (
              <p key={p.id} className="text-ink-600">
                {p.phoneType}: {p.phoneNumber}
              </p>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-ink-100 pt-6">
          <RoomsList hotelId={id} />
        </div>

        <div className="mt-8 border-t border-ink-100 pt-6">
          <ReviewsList hotelId={id} />
        </div>
      </div>
    </div>
  );
}
