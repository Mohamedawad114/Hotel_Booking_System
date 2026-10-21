import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from '../components/BookingStatusBadge';
import { useBookingDetail, useCancelBooking } from '../api/useBooking';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError } = useBookingDetail(id);
  const cancelMutation = useCancelBooking();
  const [reason, setReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  const handleCancel = () => {
    cancelMutation.mutate(
      { bookingId: id, reason },
      {
        onSuccess: (result) => {
          if (result?.refundAmount) {
            toast.success(`اتلغى الحجز، هيترد ${result.refundAmount} ${booking?.currency || ''}`);
          } else {
            toast.success('اتلغى الحجز');
          }
          setShowCancelForm(false);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'معرفناش نلغي الحجز');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-200">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-sand-200">
        <p className="text-ink-400">معرفناش نجيب تفاصيل الحجز</p>
        <button onClick={() => navigate(-1)} className="text-ink-900 underline underline-offset-4">
          ارجع
        </button>
      </div>
    );
  }

  const canCancel = booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED';
  const needsPayment = booking.status === 'PENDING';

  return (
    <div className="min-h-screen bg-sand-200 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink-900">#{booking.bookingNumber}</h1>
            <p className="text-sm text-ink-400">
              {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        {needsPayment && (
          <div className="mb-4">
            <Button onClick={() => navigate(`/bookings/${id}/pay`)} className="w-full">
              إتمام الدفع
            </Button>
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-ink-100 bg-sand-100 p-5">
          <h2 className="mb-3 font-display text-lg text-ink-900">بيانات الحجز</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-ink-400">الاسم</p>
              <p className="text-ink-900">{booking.holderFirstName} {booking.holderLastName}</p>
            </div>
            <div>
              <p className="text-ink-400">الإيميل</p>
              <p className="text-ink-900">{booking.holderEmail}</p>
            </div>
            <div>
              <p className="text-ink-400">التليفون</p>
              <p className="text-ink-900">{booking.holderPhone}</p>
            </div>
            <div>
              <p className="text-ink-400">الإجمالي</p>
              <p className="text-ink-900">{booking.totalPrice} {booking.currency}</p>
            </div>
          </div>
        </div>

        {booking.rooms?.length > 0 && (
          <div className="mb-4 rounded-2xl border border-ink-100 bg-sand-100 p-5">
            <h2 className="mb-3 font-display text-lg text-ink-900">الغرف</h2>
            <div className="flex flex-col gap-2">
              {booking.rooms.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-600">{r.roomCode} — {r.adultsCount} بالغين، {r.childrenCount} أطفال</span>
                  <span className="font-medium text-ink-900">{r.price} {booking.currency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {booking.payment && (
          <div className="mb-4 rounded-2xl border border-ink-100 bg-sand-100 p-5">
            <h2 className="mb-3 font-display text-lg text-ink-900">الدفع</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600">{booking.payment.gateway}</span>
              <span className="font-medium text-ink-900">{booking.payment.status}</span>
            </div>
          </div>
        )}

        {canCancel && (
          <div className="rounded-2xl border border-ink-100 bg-sand-100 p-5">
            {!showCancelForm ? (
              <Button variant="outline" className="border-coral text-coral hover:bg-coral/10" onClick={() => setShowCancelForm(true)}>
                إلغاء الحجز
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="سبب الإلغاء (اختياري)"
                  rows={2}
                  className="w-full rounded-xl border border-ink-100 bg-white px-4 py-2.5 focus:border-amber"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-coral text-coral hover:bg-coral/10"
                    isLoading={cancelMutation.isPending}
                    onClick={handleCancel}
                  >
                    تأكيد الإلغاء
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCancelForm(false)}>
                    تراجع
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
