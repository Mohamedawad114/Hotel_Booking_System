import { api } from '@/lib/axios';

// GET /api/rooms/:hotelId — SearchRoomsDto كـ query params
// { adults?, children?, description?, roomsType?, cursor?, limit? }
// Response: { message, data: Room[], meta: { nextCursor } }
export const getHotelRooms = (hotelId, filter) =>
  api.get(`/rooms/${hotelId}`, { params: filter });

// GET /api/rooms/:roomId/facilities — Response: { message, data: [...] } أو { message } لو مفيش
export const getRoomFacilities = (roomId) => api.get(`/rooms/${roomId}/facilities`);
