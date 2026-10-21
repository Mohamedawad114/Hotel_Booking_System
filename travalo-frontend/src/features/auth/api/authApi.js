import { api } from '@/lib/axios';

// POST /api/auth/signup — SignupDto { name, email, password, city, street, phone, date_birth }
export const signup = (payload) => api.post('/auth/signup', payload);

// POST /api/auth/login — LoginDto { email, password }
// Response: { message, data: { accessToken } } لو الدخول تم على طول
//        أو { message, data: { id } } لو الـ 2FA مفعّل على الحساب
export const login = (payload) => api.post('/auth/login', payload);

// POST /api/auth/login/2fa — TwoFADto { code, id }
// TODO: مفترض إن الـ response بنفس شكل login: { message, data: { accessToken } }
export const verifyTwoFA = (payload) => api.post('/auth/login/2fa', payload);

// POST /api/auth/confirm-email — ConfirmEmailDto { email, OTP } (الفيلد OTP كابيتال في الـ DTO الفعلي)
export const confirmEmail = (payload) => api.post('/auth/confirm-email', payload);

// GET /api/auth/resend-OTP
// TODO: تأكيد هل الإيميل بيتبعت كـ query param، الكود هنا بيفترض كده
export const resendOtp = (email) => api.get('/auth/resend-OTP', { params: { email } });

// GET /api/auth/refresh-token — refresh token جاي من httpOnly cookie (req.cookies.refreshToken)
// Response: { message, data: { accessToken } } — camelCase زي login بالظبط
export const refreshToken = () => api.get('/auth/refresh-token');
