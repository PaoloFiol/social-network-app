import { io } from 'socket.io-client';

let socket = null;

const SOCKET_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_SOCKET_URL
    : 'http://localhost:5000';

export const connectSocket = (userId) => {
  if (!userId) {
    console.warn('❌ Cannot connect socket: userId is undefined');
    return;
  }

  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('joinChat', { userId });
      console.log('📡 Sent joinChat with userId:', userId);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🛑 Socket manually disconnected');
  }
};
