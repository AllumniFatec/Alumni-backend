import { Server } from 'socket.io';

let io;
const connectedUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    socket.on('register-user', (userId) => {
      connectedUsers.set(userId, socket.id);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
        }
      }
    });
  });

  return io;
};

export const getIo = () => initSocket();
export const getConnectedUsers = () => connectedUsers;
