import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/tokenUtils';

let io: Server;

const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
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

    // Join user to their own room for targeted notifications
    socket.join(`user:${user.publicId}`);
    // Join role-based room
    socket.join(`role:${user.role}`);

    // Chat functionality
    socket.on('chat:send', (data: { receiverId: string; message: string }) => {
      io.to(`user:${data.receiverId}`).emit('chat:receive', {
        senderId: user.publicId,
        message: data.message,
        timestamp: new Date(),
      });
    });

    socket.on('chat:typing', (data: { receiverId: string }) => {
      io.to(`user:${data.receiverId}`).emit('chat:typing', {
        senderId: user.publicId,
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
