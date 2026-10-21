import { useQuery } from '@tanstack/react-query';
import { getDestinations } from '../api/destinationsApi';

export function useDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const { data } = await getDestinations();
      return data.data ?? [];
    },
    staleTime: 30 * 60 * 1000, // الباك اند نفسه بيعمل cache ليها بالساعات على الأغلب
  });
}
