import { api } from '@/lib/axios';

// GET /api/destinations — محتاج تسجيل دخول (@Auth على الكلاس)
// Response: { message, data: [...] }
// TODO: مفيش عندي DestinationDto بالتفصيل، الفيلدات الفعلية جوه كل عنصر
// مش مؤكدة 100%. مفترض حاجة قريبة من شكل بيانات Hotelbeds destinations:
// { code, name, countryCode, countryName, image? }. عدّل حسب الداتا الحقيقية.
export const getDestinations = () => api.get('/destinations');
