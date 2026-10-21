import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AvailabilityForm } from '../components/AvailabilityForm';
import { AvailabilityResults } from '../components/AvailabilityResults';
import { GuestDetailsForm } from '../components/GuestDetailsForm';
import { Button } from '@/components/ui/Button';
import { useSearchAvailability, useSelectRooms, useCreateBooking } from '../api/useBooking';

const STEPS = { SEARCH: 'search', SELECT: 'select', GUESTS: 'guests' };

export default function BookHotelPage() {
  const { id: hotelId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.SEARCH);
  const [hotelResult, setHotelResult] = useState(null);
  const [selectedRates, setSelectedRates] = useState([]); // [{ rateKey, adults, children, roomName }]

  const availabilityMutation = useSearchAvailability(hotelId);
  const selectRoomsMutation = useSelectRooms(hotelId);
  const createBookingMutation = useCreateBooking(hotelId);

  const handleSearch = (payload) => {
    availabilityMutation.mutate(payload, {
      onSuccess: (data) => {
        if (!data) {
          toast.error('مفيش نتايج للتواريخ دي');
          return;
        }
        setHotelResult(data);
        setStep(STEPS.SELECT);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'حصل خطأ في البحث');
      },
    });
  };

  const handleToggleRate = (rate, room) => {
    setSelectedRates((prev) => {
      const exists = prev.some((r) => r.rateKey === rate.rateKey);
      if (exists) return prev.filter((r) => r.rateKey !== rate.rateKey);
      // TODO: adults/children بتاعة كل rate مش مؤكدة فين بالظبط في استجابة
      // adults/children مؤكدين دلوقتي من الـ response الحقيقي (مش افتراض)
      return [
        ...prev,
        {
          rateKey: rate.rateKey,
          adults: rate.adults,
          children: rate.children,
          roomName: room.name || room.code,
          price: parseFloat(rate.net || 0),
        },
      ];
    });
  };

  const handleProceedToGuests = () => {
    if (selectedRates.length === 0) {
      toast.error('اختار غرفة واحدة على الأقل');
      return;
    }
    selectRoomsMutation.mutate(
      selectedRates.map((r) => ({ rateKey: r.rateKey, adults: r.adults, children: r.children })),
      {
        onSuccess: () => setStep(STEPS.GUESTS),
        onError: (error) => toast.error(error?.response?.data?.message || 'حصل خطأ'),
      }
    );
  };

  const handleConfirmBooking = (formData) => {
    createBookingMutation.mutate(
      {
        rooms: formData.rooms.map((r) => ({
          guests: r.guests.map((g) => ({
            firstName: g.firstName,
            lastName: g.lastName,
            age: g.age || undefined,
          })),
        })),
        holder: formData.holder,
        paymentType: formData.paymentType,
      },
      {
        onSuccess: (booking) => {
          toast.success('اتعمل الحجز بنجاح!');
          if (formData.paymentType === 'AT_WEB') {
            navigate(`/bookings/${booking.id}/pay`);
          } else {
            navigate(`/bookings/${booking.id}`);
          }
        },
        onError: (error) => {
          toast.error(error?.message || 'معرفناش نأكد الحجز');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-sand-200 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 font-display text-3xl text-ink-900">احجز إقامتك</h1>

        {step === STEPS.SEARCH && (
          <AvailabilityForm onSearch={handleSearch} isLoading={availabilityMutation.isPending} />
        )}

        {step === STEPS.SELECT && (
          <div className="flex flex-col gap-4">
            <AvailabilityResults
              hotelResult={hotelResult}
              selectedRates={selectedRates}
              onToggleRate={handleToggleRate}
            />
            {selectedRates.length > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-sand-100 px-4 py-3">
                <span className="text-sm text-ink-600">
                  الإجمالي المبدئي ({selectedRates.length} غرفة)
                </span>
                <span className="font-display text-lg text-ink-900">
                  {selectedRates.reduce((sum, r) => sum + r.price, 0).toFixed(2)} {hotelResult?.currency}
                </span>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(STEPS.SEARCH)}>
                رجوع للبحث
              </Button>
              <Button
                isLoading={selectRoomsMutation.isPending}
                disabled={selectedRates.length === 0}
                onClick={handleProceedToGuests}
              >
                متابعة ({selectedRates.length} غرفة مختارة)
              </Button>
            </div>
          </div>
        )}

        {step === STEPS.GUESTS && (
          <div className="flex flex-col gap-4">
            <GuestDetailsForm
              selectedRooms={selectedRates}
              onSubmit={handleConfirmBooking}
              isLoading={createBookingMutation.isPending}
            />
            <Button variant="ghost" onClick={() => setStep(STEPS.SELECT)}>
              رجوع للاختيار
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
