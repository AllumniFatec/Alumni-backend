import { Queue } from 'bullmq';
import { createHash, randomUUID } from 'crypto';
import { env } from '../config/env.js';

// Fila persistente (Redis + BullMQ) para não bloquear a resposta da API.
const EMAIL_QUEUE_NAME = 'alumni_emails';

const connection = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
};

const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: 500,
  },
});

const computeJobId = (payload) => {
  if (payload?.jobId) return String(payload.jobId);
  if (payload?.jobKey) {
    const hash = createHash('sha256').update(String(payload.jobKey)).digest('hex');
    return `email-${hash}`;
  }
  // fallback: sem deduplicação
  return `email-${randomUUID()}`;
};

export const enqueueEmail = (emailPayload) => {
  const jobId = computeJobId(emailPayload);
  const { email, subject, message } = emailPayload;

  // Não bloquear a API: caso o `add` falhe (Redis indisponível), apenas loga.
  void emailQueue
    .add('send', { email, subject, message }, { jobId })
    .catch((err) => {
      const msg = String(err?.message || err);
      // Se o mesmo job for enfileirado novamente, ignora.
      if (/already exists/i.test(msg)) return;
      console.error('[emailQueue] enqueue failed:', err);
    });
};

