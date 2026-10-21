import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from '../components/BookingStatusBadge';
import { useBookings } from '../api/useBooking';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BookingsListPage() {
  const { bookings, isLoading, isError, page, setPage, hasNextPage, hasPrevPage } = useBookings();

  return (
    <div className="min-h-screen bg-sand-200 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 font-display text-3xl text-ink-900">حجوزاتي</h1>

        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-sand-300" />
            ))}
          </div>
        )}

        {isError && <p className="text-coral">معرفناش نجيب حجوزاتك، حاول تاني.</p>}

        {!isLoading && !isError && bookings.length === 0 && (
          <p className="text-ink-400">لسه معملتش أي حجز.</p>
        )}

        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="flex items-center justify-between rounded-2xl border border-ink-100 bg-sand-100 p-5 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <div>
                <p className="font-display text-lg text-ink-900">#{b.bookingNumber}</p>
                <p className="text-sm text-ink-400">
                  {formatDate(b.checkIn)} — {formatDate(b.checkOut)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <BookingStatusBadge status={b.status} />
                <span className="text-sm font-medium text-ink-900">
                  {b.totalPrice} {b.currency}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {bookings.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="ghost" disabled={!hasPrevPage} onClick={() => setPage((p) => p - 1)}>
              السابق
            </Button>
            <span className="text-sm text-ink-400">صفحة {page}</span>
            <Button variant="ghost" disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>
              التالي
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
