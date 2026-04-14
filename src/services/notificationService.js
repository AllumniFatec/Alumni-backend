import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateUser } from './userService.js';
import { getPageNumber } from '../utils/validations.js';
import CustomError from '../utils/CustomError.js';
import { enqueueNotificationDispatch } from '../queues/notificationDispatcherQueue.js';

const prisma = new PrismaClient();

const actions = {
  getNotifications: 'listar notificações',
  readNotification: 'marcar notificação como lida',
};

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link,
  authorId,
  referenceId,
  postId,
  eventId,
  jobId,
}) => {
  await enqueueNotificationDispatch({
    type,
    title,
    message,
    link: link ?? null,
    authorId,
    userIds: [userId],
    referenceId,
    postId,
    eventId,
    jobId,
  });

  return {
    queued: true,
    userId,
  };
};

export const notifyManyUsers = async (users, payload) => {
  const userIds = users.map((user) => user.user_id).filter(Boolean);
  if (userIds.length === 0) return;

  await enqueueNotificationDispatch({
    ...payload,
    userIds,
  });
};

export const enqueueNotificationForAudience = async (payload) => {
  await enqueueNotificationDispatch(payload);
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

export const getCreatedNotifications = async (users, message, type) => {
  const createdNotifications = await prisma.notification.findMany({
    where: {
      user_id: { in: users },
      message,
      type,
    },
    orderBy: {
      create_date: 'desc',
    },
    take: cleanedUserIds.length,
    select: {
      notification_id: true,
      user_id: true,
      type: true,
      title: true,
      message: true,
      link: true,
      is_read: true,
      create_date: true,
    },
  });

  return createdNotifications;
};
