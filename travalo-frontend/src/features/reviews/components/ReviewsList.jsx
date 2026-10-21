import { Button } from '@/components/ui/Button';
import { AddReviewForm } from './AddReviewForm';
import { useHotelReviews } from '../api/useReviews';

function StarRow({ rating }) {
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

export function ReviewsList({ hotelId }) {
  const { data: reviews = [], isLoading, page, setPage, hasNextPage, hasPrevPage } =
    useHotelReviews(hotelId);

  return (
    <div>
      <h2 className="mb-4 font-display text-xl text-ink-900">تقييمات الفندق</h2>

      <div className="mb-6">
        <AddReviewForm hotelId={hotelId} />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-sand-300" />
          ))}
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <p className="text-ink-400">لسه مفيش تقييمات، كن أول واحد يقيّم!</p>
      )}

      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-ink-100 bg-sand-100 p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-900">{r.user?.name || 'مستخدم'}</span>
              <StarRow rating={r.rating} />
            </div>
            {r.comment && <p className="mt-1 text-sm text-ink-600">{r.comment}</p>}
          </div>
        ))}
      </div>

      {(hasPrevPage || hasNextPage) && (
        <div className="mt-4 flex items-center justify-center gap-3">
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
  );
}
