import { Button } from '@/components/ui/Button';

// السعر بيرجع كـ string في فيلد "net" (مؤكد من response حقيقي)
function getRatePrice(rate) {
  return parseFloat(rate.net || 0).toFixed(2);
}

// أقرب سياسة إلغاء (لو موجودة) — بنعرض أول واحدة بس كملخص سريع
function getCancellationNote(rate) {
  const policy = rate.cancellationPolicies?.[0];
  if (!policy) return null;
  const date = new Date(policy.from).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
  });
  return `إلغاء مجاني لحد ${date}`;
}

export function AvailabilityResults({ hotelResult, selectedRates, onToggleRate }) {
  if (!hotelResult?.rooms?.length) {
    return <p className="text-ink-400">مفيش غرف متاحة في التواريخ دي.</p>;
  }

  const currency = hotelResult.currency || '';

  return (
    <div className="flex flex-col gap-4">
      {hotelResult.rooms.map((room) => (
        <div key={room.code} className="rounded-2xl border border-ink-100 bg-sand-100 p-5">
          <h3 className="mb-3 font-display text-lg text-ink-900">{room.name || room.code}</h3>
          <div className="flex flex-col gap-2">
            {room.rates?.map((rate) => {
              const isSelected = selectedRates.some((r) => r.rateKey === rate.rateKey);
              const cancellationNote = getCancellationNote(rate);
              return (
                <div
                  key={rate.rateKey}
                  className="flex items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-ink-600">{rate.boardName || 'سعر الغرفة'}</p>
                    <p className="font-display text-lg text-ink-900">
                      {getRatePrice(rate)} {currency}
                    </p>
                    {cancellationNote && (
                      <p className="text-xs text-emerald-600">{cancellationNote}</p>
                    )}
                  </div>
                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    onClick={() => onToggleRate(rate, room)}
                  >
                    {isSelected ? 'اتلغى الاختيار' : 'اختار'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
