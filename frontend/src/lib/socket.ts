import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(token: string): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.once('connect', () => {
      s.emit('join', { token });
    });
  }
}

export function disconnectSocket(): void {
  if (socket && socket.connected) {
    socket.emit('leave', { token: localStorage.getItem('access_token') || '' });
    socket.disconnect();
  }
}

export default getSocket;
