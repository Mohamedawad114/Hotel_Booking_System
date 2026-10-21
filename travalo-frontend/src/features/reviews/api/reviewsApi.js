import { api } from '@/lib/axios';

// GET /api/reviews/:id — Response: { message, data: review }
// review فيه user متداخل: { id, rating, comment, user: { id, name } }
export const getReview = (reviewId) => api.get(`/reviews/${reviewId}`);

// GET /api/reviews/all/:hotelId?page=&limit= — offset pagination (مش cursor)
// Response: { message, data: Review[] } — نفس شكل review بتاع getReview
export const getHotelReviews = (hotelId, page = 1, limit = 10) =>
  api.get(`/reviews/all/${hotelId}`, { params: { page, limit } });

// POST /api/reviews/:hotelId — addReviewDto { rating: 1-5, comment?: 4-100 حرف }
export const addReview = (hotelId, payload) => api.post(`/reviews/${hotelId}`, payload);
