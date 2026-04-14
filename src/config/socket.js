import { Server } from 'socket.io';

let io;
const connectedUsers = new Map();

export const initSocket = (server, corsOptions) => {
  io = new Server(server, {
    cors: { origin: corsOptions },
  });

  io.on('connection', (socket) => {
    socket.on('register-user', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
        }
      }
    });
  });
};

export const getIo = () => io;
export const getConnectedUsers = () => connectedUsers;
