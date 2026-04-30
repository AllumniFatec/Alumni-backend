import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import {
  enqueueNotificationDelivery,
  NOTIFICATION_DELIVERY_QUEUE_NAME,
} from '../queues/notificationDeliveryQueue.js';
import { NOTIFICATION_DISPATCHER_QUEUE_NAME } from '../queues/notificationDispatcherQueue.js';
import { getUsersNotifications } from '../services/userService.js';
import prisma from '../config/prisma.js';

const BATCH_SIZE = 500;

const connection = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
};

const buildReferenceId = (payload) =>
  payload.referenceId ?? payload.eventId ?? payload.jobId ?? payload.postId ?? null;

const enqueueBatch = async (userIds, payload) => {
  if (userIds.length === 0) return;

  await enqueueNotificationDelivery({
    userIds,
    message: payload.message,
    type: payload.type,
    title: payload.title,
    link: payload.link,
    referenceId: buildReferenceId(payload),
  });
};

const dispatchToFixedUsers = async (payload) => {
  const requestedUserIds = Array.isArray(payload.userIds) ? payload.userIds : [];
  if (requestedUserIds.length === 0) return;

  const userIds = await getUsersNotifications(requestedUserIds);

  for (let index = 0; index < userIds.length; index += BATCH_SIZE) {
    const batch = userIds.slice(index, index + BATCH_SIZE);
    await enqueueBatch(batch, payload);
  }
};

const dispatchToAllEligibleUsers = async (payload) => {
  let cursorId;

  while (true) {
    const users = await prisma.user.findMany({
      where: {
        receive_notifications: true,
        user_status: 'Active',
        ...(payload.authorId
          ? {
              user_id: {
                not: payload.authorId,
              },
            }
          : {}),
      },
      select: {
        user_id: true,
      },
      take: BATCH_SIZE,
      ...(cursorId
        ? {
            cursor: { user_id: cursorId },
            skip: 1,
          }
        : {}),
      orderBy: {
        user_id: 'asc',
      },
    });

    if (users.length === 0) {
      break;
    }

    const userIds = users.map((user) => user.user_id);
    await enqueueBatch(userIds, payload);
    cursorId = users[users.length - 1].user_id;
  }
};

export const notificationDispatcherWorker = new Worker(
  NOTIFICATION_DISPATCHER_QUEUE_NAME,
  async (job) => {
    const payload = job.data;

    if (Array.isArray(payload.userIds) && payload.userIds.length > 0) {
      await dispatchToFixedUsers(payload);
      return;
    }

    await dispatchToAllEligibleUsers(payload);
  },
  {
    connection,
    concurrency: 5,
  }
);

notificationDispatcherWorker.on('completed', (job) => {
  console.log('[notificationDispatcherWorker] job completed:', job?.id);
});

notificationDispatcherWorker.on('failed', (job, err) => {
  console.error('[notificationDispatcherWorker] job failed:', job?.id, err);
});

notificationDispatcherWorker.on('error', (err) => {
  console.error('[notificationDispatcherWorker] worker error:', err);
});

const shutdown = async () => {
  try {
    await notificationDispatcherWorker.close();
  } catch (err) {
    console.error('[notificationDispatcherWorker] error on shutdown:', err);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(
  `[notificationDispatcherWorker] listening queue "${NOTIFICATION_DISPATCHER_QUEUE_NAME}" and dispatching to "${NOTIFICATION_DELIVERY_QUEUE_NAME}"`
);
