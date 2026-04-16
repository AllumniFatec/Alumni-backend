import { Server } from 'socket.io';
import { env } from './env.js';
import jwt from 'jsonwebtoken';
import { redisClient } from './redisClient.js';

let io;
const connectedUsers = new Map();

export const initSocket = (server, corsOptions) => {
  io = new Server(server, {
    cors: corsOptions,
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.headers.cookie
      ?.split(';')
      .find((c) => c.trim().startsWith('access_token='))
      ?.split('=')[1];

    const isRevoked = await redisClient.get(`revoked-token:${token}`);
    if (isRevoked) {
      return next(new Error('Token expirado'));
    }

    if (!token) {
      return next(new Error('Não autenticado'));
    }
    try {
      socket.data.user = jwt.verify(token, env.jwtSecret);
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('register-user', () => {
      const userId = socket.data.user.id;
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
