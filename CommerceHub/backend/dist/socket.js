"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationToUser = exports.getIo = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const userSockets = new Map(); // Maps userId to socketId
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        // When a user logs in or app loads, they send their userId
        socket.on('register', (userId) => {
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
exports.initSocket = initSocket;
const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIo = getIo;
// Helper function to send notification to a specific user
const sendNotificationToUser = (userId, eventName, data) => {
    if (!io)
        return;
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
        io.to(socketId).emit(eventName, data);
    }
};
exports.sendNotificationToUser = sendNotificationToUser;
