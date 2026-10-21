// TODO: القيم بتاعة BookingStatus enum مش مؤكدة 100% (مفترضة من الأسماء
// الشائعة). عدّل الـ map ده لو القيم الحقيقية مختلفة.
const STATUS_STYLES = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-400/30 text-amber-600',
  CANCELLED: 'bg-coral/20 text-coral',
  COMPLETED: 'bg-ink-100 text-ink-600',
};

const STATUS_LABELS = {
  CONFIRMED: 'مؤكد',
  PENDING: 'قيد الانتظار',
  CANCELLED: 'ملغي',
  COMPLETED: 'اكتمل',
};

export function BookingStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-ink-100 text-ink-600';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${style}`}>{label}</span>
  );
}
