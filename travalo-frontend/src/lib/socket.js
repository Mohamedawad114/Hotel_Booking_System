import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// الـ Gateway في الباك اند معمول بـ namespace اسمه 'public'، وبياخد
// الـ accessToken من handshake.auth.authorization (مش هيدر عادي، لأنه WebSocket)
export function createNotificationSocket(accessToken) {
  return io(`${SOCKET_URL}/public`, {
    auth: { authorization: accessToken },
    autoConnect: false,
  });
}
