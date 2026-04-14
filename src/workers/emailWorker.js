import { Worker } from 'bullmq';
import { env } from '../config/env.js';
import sendEmail from '../services/emailService.js';

const EMAIL_QUEUE_NAME = 'alumni_emails';

const connection = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
};

// Worker roda em background e consome jobs da fila.
// Ele deve ser iniciado quando o servidor subir (import em `server.js`).
export const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    // job.data deve ter a mesma estrutura esperada por `sendEmail`
    // { email, subject, message }
    return sendEmail(job.data);
  },
  {
    connection,
    concurrency: 3,
  }
);

emailWorker.on('failed', (job, err) => {
  console.error('[emailWorker] job failed:', job?.id, err);
});

emailWorker.on('completed', (job) => {
  console.log('[emailWorker] job completed:', job?.id);
});

const shutdown = async () => {
  try {
    await emailWorker.close();
  } catch (err) {
    console.error('[emailWorker] error on shutdown:', err);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
