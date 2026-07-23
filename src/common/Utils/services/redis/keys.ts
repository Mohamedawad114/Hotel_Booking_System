export const redisKeys = {
  refreshToken: (userId: number, jti?: string) =>
    `refreshToken_${userId}:${jti}`,
  OTP: (email: string) => `otp_${email}`,
  resetPassword: (email: string) => `otp_reset:${email}`,
  token_blackList: (accessToken: string) => `tokens_blacklist:${accessToken}`,
  secret: (email: string) => `${email}_secret`,
  idempotencyKey: (key: string, op: string, id: number) =>
    `idempotencyKey:${key}:${op}:${id}`,
  socketKey: (userId: string) => `user_sockets:${userId}`,
  destination: () => `destinations`,
  facility: () => `facilities`,
  getHotels: (countryCode?: string, cursor?: string, limit?: number) =>
    `hotel_${countryCode}: ${cursor}:${limit}`,
  hotelDetail: (hotelId: number) => `hotel_${hotelId}`,
  hotelRooms: (hotelId: number, cursor?: string, limit?: number) =>
    `hotelRooms: ${hotelId}_cursor:${cursor}_limit:${limit}`,
  hotelFacilities: (hotelId: number) => `hotelFacilities: ${hotelId}`,
  roomFacilities: (roomId: number) => `roomFacilities: ${roomId}`,
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
};
