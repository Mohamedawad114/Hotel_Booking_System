export const redisKeys = {
  refreshToken: (userId: string, jti: string) =>
    `refreshToken_${userId}:${jti}`,
  OTP: (email: string) => `otp_${email}`,
  resetPassword: (email: string) => `otp_reset:${email}`,
  token_blackList: (accessToken: string) => `tokens_blacklist:${accessToken}`,
  idempotencyKey: (key: string, op: string, id: number) =>
    `idempotencyKey:${key}:${op}:${id}`,
  socketKey: (userId: string) => `user_sockets:${userId}`,
  onlineUsers: () => `online:users`,
  chatHistory: (conversationId:string) => `chatMessages:${conversationId}`,
};


export const TTL = {
  refreshToken: 60 * 60 * 24 * 7, 
}