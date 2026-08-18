import { SearchAvailabilityDto } from 'src/modules/booking/dto/checkAvailability.dto';
import { SearchArgs } from 'src/modules/hotel/Dto/search.dto';

export const redisKeys = {
  refreshToken: (userId: number, jti?: string) =>
    `refreshToken_${userId}:${jti}`,
  OTP: (email: string) => `otp_${email}`,
  resetPassword: (email: string) => `otp_reset:${email}`,
  token_blackList: (accessToken: string) => `tokens_blacklist:${accessToken}`,
  secret: (email: string) => `${email}_secret`,
  idempotencyKey: (userId: number, id: number, key: string) =>
    `idempotency:${userId}:${id}:${key}`,
  socketKey: (userId: string) => `user_sockets:${userId}`,
  destination: () => `destinations`,
  facility: () => `facilities`,
  getHotels: (query?: SearchArgs, sortField?: string,cursor?:string) =>
    `hotel:${query?.countryCode ?? 'all'}:destinationCode=${query?.destinationCode}:sortBy=${sortField ?? 'createdAt'}:${query?.rating ?? query?.ranking ?? 'desc'}:cursor=${cursor ?? 'start'}:limit=${query?.limit ?? 20}`,
  hotelDetail: (hotelId: number) => `hotel_${hotelId}`,
  hotelRooms: (hotelId: number, cursor?: string, limit?: number) =>
    `hotelRooms: ${hotelId}_cursor:${cursor}_limit:${limit}`,
  hotelFacilities: (hotelId: number) => `hotelFacilities: ${hotelId}`,
  roomFacilities: (roomId: number) => `roomFacilities: ${roomId}`,
  availability: (hotelId: number, dto: SearchAvailabilityDto) =>
    `hotel:${hotelId} :checkIn:${dto.checkIn.toISOString()}:checkOut:${dto.checkOut.toISOString()}:adults:${dto.adults}:children:${dto.children}`,
  selectionRooms: (hotelCode: number, userId: number) =>
    `selection:${hotelCode}:${userId}`,
  userLock: (userId: number) => `userLocked:${userId}`,
  hotelName: (bookingId: number) => ` bookingId:${bookingId}=>hotelName`,
  // chatHistory: (conversationId: string) => `chatMessages:${conversationId}`,
};

export const TTL = {
  refreshToken: 60 * 60 * 24 * 7,
  secret: 60 * 5,
  OTP: 60 * 2,
  token_blackList: 60 * 30,
  destination: 60 * 60 * 24 * 7,
  facilities: 60 * 60 * 24 * 7,
  hotels: 60 * 60 * 24 * 30,
  hotelDetail: 60 * 60 * 24 * 30,
  hotelRooms: 60 * 60 * 24,
  hotelFacilities: 60 * 60 * 24 * 30,
  roomFacilities: 60 * 60 * 24 * 30,
  availability: 60 * 2,
  userLock: 60 * 5,
  idempotencyKey: 60 * 5,
  selectionRooms: 60 * 10,
  hotelName: 60 * 15,
};
