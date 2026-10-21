import { useEffect } from 'react';
import { refreshAccessToken } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

// بيتنادى مرة واحدة عند تحميل التطبيق: بيحاول يستخدم الـ refresh token
// cookie عشان يجيب access token جديد من غير ما اليوزر يعمل login تاني.
//
// ⚠️ لازم ينادي refreshAccessToken() (الدالة المشتركة في lib/axios.js)
// مش api.get('/auth/refresh-token') مباشرة — عشان لو الـ effect اتنفذ
// مرتين (React 18 StrictMode في dev) أو أي نداء تاني حصل في نفس اللحظة
// من الـ response interceptor، الاتنين يشتركوا في نفس الـ request الفعلي
// بدل ما يبعتوا طلبين متزامنين على refresh token اللي هو single-use في
// الباك اند (والطلب التاني هيفشل بـ 403 لأن التوكن اتمسح بالفعل).
export function useBootstrapAuth() {
  const finishBootstrapping = useAuthStore((s) => s.finishBootstrapping);

  useEffect(() => {
    let cancelled = false;

    refreshAccessToken()
      .catch(() => {
        // مفيش جلسة سابقة أو الـ refresh token منتهي، عادي
      })
      .finally(() => {
        if (!cancelled) finishBootstrapping();
      });

    return () => {
      cancelled = true;
    };
  }, [finishBootstrapping]);
}
