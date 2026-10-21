function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// TODO: القيم دي شوفناها في كود الـ handlers (createdBooking, canceledBooking,
// confirmedBooking, ...Admin variants) بس مش عندي enum NotificationTitle
// كامل. لو ظهر title مش موجود هنا، بيتعرض زي ما هو كـ fallback.
const TITLE_LABELS = {
  createdBooking: 'تم إنشاء الحجز',
  confirmedBooking: 'تأكد الحجز',
  canceledBooking: 'اتلغى الحجز',
};

export function NotificationItem({ notification }) {
  const label = TITLE_LABELS[notification.title] || notification.title;

  return (
    <div
      className={`rounded-xl border border-ink-100 p-4 ${
        notification.isRead ? 'bg-sand-100' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink-900">{label}</p>
          {notification.content && (
            <p className="mt-1 text-sm text-ink-600">{notification.content}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-ink-400">{formatDate(notification.createdAt)}</span>
      </div>
    </div>
  );
}
