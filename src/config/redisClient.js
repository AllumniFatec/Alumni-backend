import Redis from 'ioredis';
import { env } from './env.js';

const connection = {
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
};

export const redisClient = new Redis(connection);

redisClient.on('error', (err) => {
  console.error('[redis] connection error:', err?.message || err);
});

