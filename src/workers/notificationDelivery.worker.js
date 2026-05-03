import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import { getIo } from '../config/socket.js';
import { NOTIFICATION_DELIVERY_QUEUE_NAME } from '../queues/notificationDeliveryQueue.js';
import { getCreatedNotifications } from '../services/notificationService.js';
import prisma from '../config/prisma.js';

const connection = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
};

const emitNotification = (notificationByUserId) => {
  const io = getIo();
  if (!io) return;

  for (const [userId, notification] of notificationByUserId.entries()) {
    const roomName = `user:${userId}`;
    io.to(roomName).emit('new_notification', notification);
  }
};

export const notificationDeliveryWorker = new Worker(
  NOTIFICATION_DELIVERY_QUEUE_NAME,
  async (job) => {
    const { userIds, message, type, title, link } = job.data;
    const cleanedUserIds = Array.from(new Set((userIds ?? []).filter(Boolean)));

    if (cleanedUserIds.length === 0) {
      return;
    }

    const rows = cleanedUserIds.map((userId) => ({
      user_id: userId,
      type,
      title: title ?? 'Nova notificação',
      message,
      link: link ?? null,
    }));

    await prisma.notification.createMany({
      data: rows,
    });

    const createdNotifications = await getCreatedNotifications(cleanedUserIds, message, type);

    const notificationByUserId = new Map();
    for (const notification of createdNotifications) {
      if (!notificationByUserId.has(notification.user_id)) {
        notificationByUserId.set(notification.user_id, notification);
      }
    }

    emitNotification(notificationByUserId);
  },
  {
    connection,
    concurrency: 10,
  }
);

notificationDeliveryWorker.on('completed', (job) => {
  console.log('[notificationDeliveryWorker] job completed:', job?.id);
});

notificationDeliveryWorker.on('failed', (job, err) => {
  console.error('[notificationDeliveryWorker] job failed:', job?.id, err);
});

notificationDeliveryWorker.on('error', (err) => {
  console.error('[notificationDeliveryWorker] worker error:', err);
});

const shutdown = async () => {
  try {
    await notificationDeliveryWorker.close();
  } catch (err) {
    console.error('[notificationDeliveryWorker] error on shutdown:', err);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`[notificationDeliveryWorker] listening queue "${NOTIFICATION_DELIVERY_QUEUE_NAME}"`);
