import { api } from '@/lib/axios';

// GET /api/favorites — Response: { message, data: Favorite[] }
// TODO: مش مؤكد لو كل favorite فيه الفندق كامل جواه (nested) ولا hotelId بس
export const getFavorites = () => api.get('/favorites');

// POST /api/favorites/:hotelId
export const addFavorite = (hotelId) => api.post(`/favorites/${hotelId}`);

// DELETE /api/favorites/:hotelId
export const removeFavorite = (hotelId) => api.delete(`/favorites/${hotelId}`);
