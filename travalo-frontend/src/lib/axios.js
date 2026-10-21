import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// إضافة access token لكل request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⚠️ FIX: الـ refresh token عند الباك اند single-use (بيتمسح من redis أول
// ما يتستخدم). لو فيه أكتر من نداء لـ refresh-token بيحصلوا في نفس اللحظة
// (زي React 18 StrictMode اللي بتشغّل الـ useEffect مرتين في dev، أو أي
// تعدد تبويبات/طلبات)، الباك اند بياخد أول واحد بس والباقي بيفشل بـ 403
// لأن التوكن اتمسح بالفعل. الحل: refreshPromise واحد مشترك (singleton) —
// أي حد ينادي refreshAccessToken() وهو في نص عملية refresh بيستنى نفس
// الـ promise بدل ما يبعت request تاني. useBootstrapAuth والـ interceptor
// هنا لازم الاتنين ينادوا الدالة دي، مش يعملوا api.get('/auth/refresh-token')
// مباشرة، عشان يضمنوا إن request واحد بس فعلي بيتبعت مهما كان مصدر النداء.
let refreshPromise = null;

export function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = api
    .get('/auth/refresh-token')
    .then(({ data }) => {
      const token = data.data.accessToken;
      useAuthStore.getState().setAccessToken(token);
      return token;
    })
    .catch((err) => {
      useAuthStore.getState().clearSession();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// معالجة الـ 401: نحاول refresh (عن طريق نفس الدالة المشتركة فوق)، لو فشل logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);
