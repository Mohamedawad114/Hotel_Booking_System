import { api } from '@/lib/axios';
import { graphqlRequest } from '@/lib/graphql';

// POST /api/booking/:hotelId/searchAvailability
// SearchAvailabilityDto { checkIn: Date, checkOut: Date, adults: number, children: number, childrenAges?: [{age}] }
// Response: { message, data: result } — result = response.data.hotels.hotels
// من Hotelbeds hotel-api (شكل مؤكد دلوقتي: array فيه فندق واحد بس، جواه
// rooms[], وكل room فيه rates[] وكل rate فيه rateKey + net/sellingRate)
export const searchAvailability = (hotelId, payload) =>
  api.post(`/booking/${hotelId}/searchAvailability`, payload);

// POST /api/booking/:hotelId/selectRooms
// { rooms: [{ rateKey, adults, children }] } — بيتخزن في redis session
export const selectRooms = (hotelId, rooms) =>
  api.post(`/booking/${hotelId}/selectRooms`, { rooms });

// createBooking — GraphQL Mutation (مش REST!)
// input: BookingInput { rooms: [{ guests: [{firstName,lastName,age?}] }], holder: {firstName,lastName,email,phone}, paymentType }
// لازم Idempotency-Key header زي الـ cancel
const CREATE_BOOKING_MUTATION = /* GraphQL */ `
  mutation CreateBooking($hotelId: Int!, $input: BookingInput!) {
    createBooking(hotelId: $hotelId, input: $input) {
      id
      bookingNumber
      totalPrice
      status
      checkIn
      checkOut
      currency
      paymentType
      holderFirstName
      holderLastName
      holderEmail
      holderPhone
      rooms {
        id
        roomCode
        price
        adultsCount
        childrenCount
      }
    }
  }
`;

export const createBooking = (hotelId, input, idempotencyKey) =>
  graphqlRequest(
    CREATE_BOOKING_MUTATION,
    { hotelId, input },
    { 'Idempotency-Key': idempotencyKey }
  ).then((data) => data.createBooking);

// GET /api/booking?page=&limit= — Response: { message, data, meta: { page, limit, total } }
export const getBookings = (page = 1, limit = 20) =>
  api.get('/booking', { params: { page, limit } });

// GET /api/booking/:id — Response: { message, data: booking } (بيتضمن rooms + payment)
export const getBookingDetail = (id) => api.get(`/booking/${id}`);

// DELETE /api/booking/:bookingId/cancel — لازم Idempotency-Key header
export const cancelBooking = (bookingId, reason, idempotencyKey) =>
  api.delete(`/booking/${bookingId}/cancel`, {
    data: { reason },
    headers: { 'Idempotency-Key': idempotencyKey },
  });
