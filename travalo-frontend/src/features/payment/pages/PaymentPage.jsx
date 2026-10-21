import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

import { stripePromise } from '@/lib/stripe';
import { useInitiatePayment } from '../api/usePayment';
import { PaymentIntentForm } from '../components/PaymentIntentForm';
import { useBookingDetail } from '@/features/booking/api/useBooking';

export default function PaymentPage() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const { data: booking } = useBookingDetail(bookingId);
  const initiateMutation = useInitiatePayment(bookingId);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    if (!bookingId) return;
    // TODO: gateway مبعوت هنا 'stripe' مباشرة بافتراض إنه الوحيد المتاح.
    // لو فيه أكتر من gateway، اعرض usePaymentGateways() كاختيار قبل البدء.
    initiateMutation.mutate(
      { gateway: 'stripe' },
      {
        onSuccess: (result) => setClientSecret(result.clientSecret),
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'معرفناش نبدأ عملية الدفع');
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-sand-200 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 font-display text-3xl text-ink-900">إتمام الدفع</h1>
        {booking && (
          <p className="mb-6 text-ink-400">
            حجز #{booking.bookingNumber} — {booking.totalPrice} {booking.currency}
          </p>
        )}

        <div className="rounded-2xl border border-ink-100 bg-sand-100 p-6 shadow-soft">
          {initiateMutation.isPending && (
            <div className="flex justify-center py-8">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
            </div>
          )}

          {initiateMutation.isError && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-coral">معرفناش نبدأ عملية الدفع.</p>
              <button
                onClick={() => navigate(`/bookings/${bookingId}`)}
                className="text-sm text-ink-900 underline underline-offset-4"
              >
                ارجع لتفاصيل الحجز
              </button>
            </div>
          )}

          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: 'stripe' } }}
            >
              <PaymentIntentForm bookingId={bookingId} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
