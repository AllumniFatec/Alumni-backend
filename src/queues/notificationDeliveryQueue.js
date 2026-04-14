import { Queue } from 'bullmq';
import { createHash } from 'crypto';
import { env } from '../config/env.js';

export const NOTIFICATION_DELIVERY_QUEUE_NAME = 'notification-delivery';

const connection = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
};

export const notificationDeliveryQueue = new Queue(NOTIFICATION_DELIVERY_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: 2000,
  },
});

const buildDeliveryJobId = (payload) => {
  const idsKey = Array.isArray(payload?.userIds) ? payload.userIds.join(',') : '';
  const rawKey = `${payload?.type ?? 'notification'}:${payload?.referenceId ?? ''}:${idsKey}:${payload?.message ?? ''}`;
  return `notification-delivery-${createHash('sha256').update(rawKey).digest('hex')}`;
};

export const enqueueNotificationDelivery = async (payload) => {
  const jobId = buildDeliveryJobId(payload);

  await notificationDeliveryQueue.add('deliver', payload, { jobId });
};
