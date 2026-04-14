import { Queue } from 'bullmq';
import { createHash } from 'crypto';
import { env } from '../config/env.js';

export const NOTIFICATION_DISPATCHER_QUEUE_NAME = 'notification-dispatcher';

const connection = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
};

export const notificationDispatcherQueue = new Queue(NOTIFICATION_DISPATCHER_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

const buildDispatchJobId = (payload) => {
  const rawKey =
    payload?.jobKey ??
    `${payload?.type ?? 'notification'}:${payload?.authorId ?? 'anonymous'}:${payload?.referenceId ?? ''}:${payload?.message ?? ''}`;
  return `notification-dispatch-${createHash('sha256').update(String(rawKey)).digest('hex')}`;
};

export const enqueueNotificationDispatch = async (payload) => {
  const jobId = buildDispatchJobId(payload);

  await notificationDispatcherQueue.add('dispatch', payload, { jobId });
};
