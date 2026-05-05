import { Server } from 'socket.io';
import { env } from './env.js';
import jwt from 'jsonwebtoken';
import { redisClient } from './redisClient.js';
import {
  markMessageAsRead,
  saveMessage,
  validateChatParticipation,
} from '../services/chatService.js';

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

    if (!token) {
      return next(new Error('Não autenticado'));
    }

    const isRevoked = await redisClient.get(`revoked-token:${token}`);
    if (isRevoked) {
      return next(new Error('Token expirado'));
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

    socket.on('join-chat', async (chatId) => {
      try {
        const userId = socket.data.user.id;

        await validateChatParticipation(userId, chatId);

        socket.join(`chat:${chatId}`);

        await markMessageAsRead(userId, chatId);
      } catch (err) {
        socket.emit('join-chat-error', {
          chatId,
          error: err.message || 'Erro ao entrar no chat',
        });
      }
    });

    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('send-message', async (chatId, content) => {
      try {
        const senderId = socket.data.user.id;

        const socketsInRoom = await io.in(`chat:${chatId}`).fetchSockets();
        const readByUserIds = Array.from(
          new Set(
            socketsInRoom.map((s) => s.data?.user?.id).filter(Boolean),
          ),
        );

        const message = await saveMessage(
          socket.data.user,
          chatId,
          content,
          readByUserIds,
        );

        io.to(`chat:${chatId}`).emit('receive-message', {
          message,
          authorId: senderId,
        });
      } catch (err) {
        socket.emit('send-message-error', {
          chatId,
          error: err.message || 'Erro ao enviar mensagem',
        });
      }
    });

    socket.on('typing', (chatId, { isTyping }) => {
      socket.broadcast.to(`chat:${chatId}`).emit('typing', {
        userId: socket.data.user.id,
        isTyping,
      });
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
