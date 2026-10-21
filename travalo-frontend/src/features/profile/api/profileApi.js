import { api } from '@/lib/axios';

// GET /api/profile — Response: { data: { profile: {...} }, message }
export const getProfile = () => api.get('/profile');

// PUT /api/profile/update-profile — UpdateProfileDto (كل الفيلدات optional)
// { name?, email?, city?, street?, phone? }
// ملاحظة: لو غيّرت الإيميل، isConfirmed بترجع false وبيتبعتلك OTP تأكيد تاني
export const updateProfile = (payload) => api.put('/profile/update-profile', payload);

// PATCH /api/profile/update-password — UpdatePasswordDto
// { oldPassword, newPassword, confirmNewPassword }
export const updatePassword = (payload) => api.patch('/profile/update-password', payload);

// GET /api/profile/reset-passwordReq?email=... — public، مفيش @Auth عليها
export const requestPasswordReset = (email) =>
  api.get('/profile/reset-passwordReq', { params: { email } });

// GET /api/profile/resend-OTP-reset?email=... — public برضو
export const resendPasswordResetOtp = (email) =>
  api.get('/profile/resend-OTP-reset', { params: { email } });

// PATCH /api/profile/reset-password?email=...
// الإيميل بيتبعت كـ query param منفصل عن الـ body (مش جوه الـ DTO)
// DTO: { OTP, newPassword, confirmPassword }
export const resetPassword = ({ email, OTP, newPassword, confirmPassword }) =>
  api.patch(
    '/profile/reset-password',
    { OTP, newPassword, confirmPassword },
    { params: { email } }
  );

// GET /api/profile/setup-2fa — Response: { data: { qr: "..." } } نص لو حطيته في src بيفتح كـ QR
export const setupTwoFA = () => api.get('/profile/setup-2fa');

// PATCH /api/profile/enable-2fa — Payload: { code }
// Response: { message, data: { backupCodes } } — أكواد استرجاع بتتعرض مرة واحدة بس
export const enableTwoFA = (payload) => api.patch('/profile/enable-2fa', payload);

// POST /api/profile/photo — رفع صورة البروفايل (FileInterceptor field name: "file")
// محتاج تسجيل دخول (@Auth على الـ route)
// Response: { message, data: { public_id } } — مفيش رابط الصورة في الـ response
// نفسه، لازم نعمل refetch لـ /profile بعد الرفع عشان نجيب الرابط الجديد
export const uploadProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// DELETE /api/profile/logout — تسجيل خروج من الجهاز الحالي بس
export const logoutRequest = () => api.delete('/profile/logout');

// DELETE /api/profile/logoutAll — تسجيل خروج من كل الأجهزة
export const logoutAllRequest = () => api.delete('/profile/logoutAll');
