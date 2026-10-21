import { Button } from '@/components/ui/Button';
import { NotificationItem } from '../components/NotificationItem';
import { useNotifications } from '../api/useNotifications';

export default function NotificationsPage() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();

  const notifications = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="min-h-screen bg-sand-200 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 font-display text-3xl text-ink-900">الإشعارات</h1>

        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-sand-300" />
            ))}
          </div>
        )}

        {isError && <p className="text-coral">معرفناش نجيب الإشعارات.</p>}

        {!isLoading && !isError && notifications.length === 0 && (
          <p className="text-ink-400">مفيش إشعارات لسه.</p>
        )}

        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <NotificationItem key={n._id || n.id} notification={n} />
          ))}
        </div>

        {hasNextPage && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline" isLoading={isFetchingNextPage} onClick={() => fetchNextPage()}>
              عرض المزيد
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
