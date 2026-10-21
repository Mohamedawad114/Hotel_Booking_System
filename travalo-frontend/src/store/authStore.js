import { create } from 'zustand';

// access token بيتخزن في الـ memory بس (مش localStorage) لحماية أفضل من XSS.
// عند عمل refresh للصفحة، الـ App بيحاول يجدد الـ token عن طريق /auth/refresh-token
// (اللي بيعتمد على الـ refresh token cookie), شوف hooks/useBootstrapAuth.js
export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isBootstrapping: true, // true لحد ما نحاول نجدد الجلسة أول مرة

  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: Boolean(token) }),

  setUser: (user) => set({ user }),

  // login/2fa بيرجعوا accessToken بس من غير user object،
  // فبنسيب user فاضي وبنجيبه بعدين من GET /profile (useProfile hook)
  setSession: ({ accessToken }) =>
    set({ accessToken, isAuthenticated: true }),

  clearSession: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),

  finishBootstrapping: () => set({ isBootstrapping: false }),
}));
