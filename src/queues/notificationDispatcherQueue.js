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

const resolveReferenceId = (payload) =>
  payload?.referenceId ?? payload?.postId ?? payload?.eventId ?? payload?.jobId ?? '';

const buildDispatchJobId = (payload) => {
  const idsKey = Array.isArray(payload?.userIds)
    ? [...new Set(payload.userIds.filter(Boolean))].sort().join(',')
    : 'all';
  const rawKey =
    payload?.jobKey ??
    `${payload?.type ?? 'notification'}:${payload?.authorId ?? 'anonymous'}:${resolveReferenceId(payload)}:${idsKey}:${payload?.message ?? ''}`;
  return `notification-dispatch-${createHash('sha256').update(String(rawKey)).digest('hex')}`;
};

export const enqueueNotificationDispatch = async (payload) => {
  const jobId = buildDispatchJobId(payload);

  await notificationDispatcherQueue.add('dispatch', payload, { jobId });
};
