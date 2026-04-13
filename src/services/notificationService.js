import { PrismaClient } from '../generated/prisma/index.js';
import { getIo, getConnectedUsers } from '../../server.js';
import { authenticateUser } from './userService.js';
import { getPageNumber } from '../utils/validations.js';

const prisma = new PrismaClient();

const actions = {
  getNotifications: 'listar notificações',
  readNotification: 'marcar notificação como lida',
};

export const createNotification = async ({ userId, type, title, message, link }) => {
  const notification = await prisma.notification.create({
    data: {
      user_id: userId,
      type: type,
      title: title,
      message: message,
      link: link ?? null,
    },
  });

  //envio da notificação em tempo real para o usuário
  const io = getIo();
  const connectedUsers = getConnectedUsers();
  const socketId = connectedUsers.get(userId);

  if (socketId && io) {
    io.to(socketId).emit('new_notification', notification);
  }

  return notification;
};

export const notifyManyUsers = async (users, payload) => {
  await Promise.all(users.map((user) => createNotification({ userId: user.user_id, ...payload })));
};

export const getNotifications = async (userToken, page = 1) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getNotifications, async (user) => {
    const currentPageNumber = getPageNumber(page);
    const limit = 10;
    const skip = (currentPageNumber - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        skip: skip,
        take: limit,
        where: {
          user_id: user_id,
        },
        select: {
          notification_id: true,
          title: true,
          message: true,
          link: true,
          is_read: true,
        },
        orderBy: {
          create_date: 'desc',
        },
      }),

      prisma.notification.count({
        where: {
          user_id: user_id,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      notifications: notifications,
      pagination: {
        page: currentPageNumber,
        limit: limit,
        totalItems: total,
        totalPages: totalPages,
        hasNextPage: currentPageNumber < totalPages,
        hasPreviousPage: currentPageNumber > 1,
      },
    };
  });
};

export const readNotification = async (userToken, notificationId) => {
  const user_id = userToken.id;
  const notification_id = notificationId;

  return authenticateUser(user_id, actions.readNotification, async (user) => {
    const notification = await prisma.notification.findUnique({
      where: {
        notification_id: notification_id,
      },
    });

    if (!notification) {
      throw new CustomError('Notificação não encontrada', 404);
    }

    if (notification.user_id !== user_id) {
      throw new CustomError('Usuário não autorizado a marcar esta notificação como lida', 403);
    }

    await prisma.notification.update({
      where: {
        notification_id: notification_id,
      },
      data: {
        is_read: true,
      },
    });

    return { message: 'Notificação lida com sucesso!' };
  });
};
