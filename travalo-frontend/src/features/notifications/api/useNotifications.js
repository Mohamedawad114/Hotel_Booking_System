import { useInfiniteQuery } from '@tanstack/react-query';
import { getNotifications } from './notificationApi';

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam }) => {
      const { data } = await getNotifications(pageParam, 20);
      return data; // { message, data: [...], meta?: cursor }
    },
    initialPageParam: undefined,
    // meta نفسه هو الـ cursor (نص)، مش { nextCursor }
    getNextPageParam: (lastPage) => lastPage.meta || undefined,
  });
}
