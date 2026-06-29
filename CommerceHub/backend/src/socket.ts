import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;
const userSockets = new Map<string, string>(); // Maps userId to socketId

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // When a user logs in or app loads, they send their userId
    socket.on('register', (userId: string) => {
      userSockets.set(userId, socket.id);
      console.log(`Registered user ${userId} to socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Remove from map on disconnect
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper function to send notification to a specific user
export const sendNotificationToUser = (userId: string, eventName: string, data: any) => {
  if (!io) return;
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(eventName, data);
  }
};
