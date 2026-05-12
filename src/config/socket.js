import { Server } from 'socket.io';
import { env } from './env.js';
import jwt from 'jsonwebtoken';
import { redisClient } from './redisClient.js';
import {
  markMessageAsRead,
  saveMessage,
  validateChatParticipation,
  getUnreadCount,
  getChatUnreadCount,
} from '../services/chatService.js';

let io;
const connectedUsers = new Map();

const checkSocketRateLimit = async (userId, maxRequests = 30, windowSeconds = 30) => {
  if (!env.rateLimit.enabled) return true;
  const key = `ratelimit:socket-msg:${userId}`;
  const count = await redisClient.eval(
    "local c = redis.call('INCR', KEYS[1]) if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return c",
    1,
    key,
    windowSeconds
  );
  return count <= maxRequests;
};

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
      if (!connectedUsers.has(userId)) connectedUsers.set(userId, new Set());
      connectedUsers.get(userId).add(socket.id);
      socket.join(`user:${userId}`);
    });

    socket.on('join-chat', async (chatId) => {
      try {
        const userId = socket.data.user.id;

        await validateChatParticipation(userId, chatId);

        socket.join(`chat:${chatId}`);

        await markMessageAsRead(userId, chatId);

        const [total, chatUnread] = await Promise.all([
          getUnreadCount(userId),
          getChatUnreadCount(userId, chatId),
        ]);
        socket.emit('unread-count-update', { total, chatId, chatUnread });
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

        const allowed = await checkSocketRateLimit(senderId);
        if (!allowed) {
          socket.emit('send-message-error', { chatId, error: 'Muitas mensagens. Aguarde alguns segundos.' });
          return;
        }

        const socketsInRoom = await io.in(`chat:${chatId}`).fetchSockets();
        const readByUserIds = Array.from(
          new Set(
            socketsInRoom.map((s) => s.data?.user?.id).filter(Boolean),
          ),
        );

        const { message, participantIds } = await saveMessage(
          socket.data.user,
          chatId,
          content,
          readByUserIds,
        );

        io.to(`chat:${chatId}`).emit('receive-message', {
          message,
          authorId: senderId,
        });

        const recipientIds = participantIds.filter((id) => !readByUserIds.includes(id));

        await Promise.all(
          recipientIds.map(async (recipientId) => {
            const [total, chatUnread] = await Promise.all([
              getUnreadCount(recipientId),
              getChatUnreadCount(recipientId, chatId),
            ]);
            io.to(`user:${recipientId}`).emit('unread-count-update', { total, chatId, chatUnread });
          })
        );
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
      const userId = socket.data.user?.id;
      if (userId) {
        const sockets = connectedUsers.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) connectedUsers.delete(userId);
        }
      }
    });
  });
};

export const getIo = () => io;
export const getConnectedUsers = () => connectedUsers;
