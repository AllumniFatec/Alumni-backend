import { redisClient } from '../config/redisClient.js';
import { env } from '../config/env.js';

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 30;

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')?.[0]?.trim() || req.ip || 'unknown-ip';

export const createRateLimit = ({
  keyPrefix = 'api',
  windowSeconds = WINDOW_SECONDS,
  maxRequests = MAX_REQUESTS,
  getIdentifier,
} = {}) => {
  return async (req, res, next) => {
    if (!env.rateLimit.enabled) {
      return next();
    }

    const now = Date.now();
    const identifier = getIdentifier?.(req) || getClientIp(req);
    const redisKey = `ratelimit:${keyPrefix}:${identifier}`;

    try {
      const [requestCount, ttl] = await redisClient.eval(
        "local c = redis.call('INCR', KEYS[1]) if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return {c, redis.call('TTL', KEYS[1])}",
        1,
        redisKey,
        windowSeconds
      );
      const retryAfterSeconds = Math.max(ttl, 0);
      const remaining = Math.max(maxRequests - requestCount, 0);

      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      res.setHeader('X-RateLimit-Reset', String(Math.floor(now / 1000) + retryAfterSeconds));

      if (requestCount > maxRequests) {
        res.setHeader('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({
          message: 'Muitas requisições. Tente novamente em instantes.',
        });
      }

      return next();
    } catch (err) {
      // Fail-open para não indisponibilizar a API em caso de falha de Redis.
      console.error('[rate-limit] failed to validate request:', err?.message || err);
      return next();
    }
  };
};
