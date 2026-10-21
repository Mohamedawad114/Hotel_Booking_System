import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useMyPayments } from '../api/usePayment';

export default function PaymentsListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMyPayments(page);
  const payments = data?.data ?? [];
  const totalPages = data?.meta?.pages ?? 1;

  return (
    <div className="min-h-screen bg-sand-200 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 font-display text-3xl text-ink-900">مدفوعاتي</h1>

        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-sand-300" />
            ))}
          </div>
        )}

        {isError && <p className="text-coral">معرفناش نجيب المدفوعات.</p>}

        {!isLoading && !isError && payments.length === 0 && (
          <p className="text-ink-400">لسه مفيش مدفوعات.</p>
        )}

        <div className="flex flex-col gap-3">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-ink-100 bg-sand-100 p-4">
              <div>
                <p className="text-sm text-ink-400">{p.paymentId}</p>
                <p className="text-ink-900">{p.amount}</p>
              </div>
              <span className="text-sm text-ink-600">{p.status}</span>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              السابق
            </Button>
            <span className="text-sm text-ink-400">صفحة {page} من {totalPages}</span>
            <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              التالي
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
