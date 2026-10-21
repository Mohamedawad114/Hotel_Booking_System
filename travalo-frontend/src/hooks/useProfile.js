import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getProfile } from '@/features/profile/api/profileApi';
import { useAuthStore } from '@/store/authStore';

// بيتنادى في أي صفحة محتاجة بيانات اليوزر (زي الـ Dashboard)
// لأن الـ login/2fa بيرجعوا accessToken بس من غير تفاصيل اليوزر
export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await getProfile();
      // response الفعلي: { data: { profile: {...} }, message }
      return data.data.profile;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  return query;
}
