import Redis from 'ioredis';
import { env } from './env.js';

// Opções compartilhadas entre todas as conexões Redis.
// - maxRetriesPerRequest: null → necessário para BullMQ (ele gerencia retries internamente).
// - enableReadyCheck: false → acelera reconexão.
// - retryStrategy: backoff exponencial com teto de 3s.
const baseOptions = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 200, 3000),
};

// Cliente principal — usado para rate limiting, tokens revogados e presença.
export const redisClient = new Redis(baseOptions);

// Cliente dedicado para subscribers (Socket.IO / pub-sub).
// Redis não permite usar a mesma conexão para SUBSCRIBE e comandos normais.
export const redisSubscriber = new Redis(baseOptions);

redisClient.on('error', (err) => {
  console.error('[redis:client] connection error:', err?.message || err);
});

redisSubscriber.on('error', (err) => {
  console.error('[redis:subscriber] connection error:', err?.message || err);
});

// Exporta as opções base para que filas BullMQ usem a mesma config
// sem instanciar novos clientes Redis — BullMQ cria as próprias conexões internamente.
export const redisConnectionOptions = baseOptions;
