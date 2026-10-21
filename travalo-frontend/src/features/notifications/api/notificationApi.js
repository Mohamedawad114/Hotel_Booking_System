import { api } from '@/lib/axios';

// GET /api/notifications?cursor=&limit= — cursor pagination
// Response: { message, data: [...] } لو مفيش نتايج (من غير meta)
// أو { message, data: [...], meta: nextCursor } — ⚠️ meta هنا نص (cursor)
// مباشرة، مش { nextCursor } object زي باقي الموديولز التانية.
// ملاحظة: الباك اند بيعلّم النوتيفيكيشنز كـ "مقروءة" تلقائيًا أول ما بتتجاب.
export const getNotifications = (cursor, limit = 20) =>
  api.get('/notifications', { params: { cursor, limit } });
