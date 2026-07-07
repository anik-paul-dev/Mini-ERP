import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/tokenUtils';

let io: Server;

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split('=');
    if (!rawName || rawValue.length === 0) return cookies;

    cookies[rawName] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
};

const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = socket.handshake.auth.token || cookies.accessToken;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.publicId}`);

    socket.join(`user:${user.publicId}`);
    socket.join(`role:${user.role}`);

    socket.on('chat:typing', (data: { receiverPublicId: string }) => {
      io.to(`user:${data.receiverPublicId}`).emit('chat:typing', {
        senderPublicId: user.publicId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.publicId}`);
    });
  });

  console.log('Socket.IO initialized');
  return io;
};

const getIO = (): Server => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export { initSocket, getIO };
