/**
 * Rate Limiting Middleware
 *
 * Protects API endpoints from abuse using KV storage for rate tracking.
 */

import { Context, Next } from "hono";
import { Env } from "../lib/auth";
import { log } from "../lib/logger";

interface RateLimitOptions {
  /** Maximum requests per window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
  /** Key prefix for KV storage */
  keyPrefix?: string;
}

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

/**
 * Create rate limit middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const { limit, windowSeconds, keyPrefix = 'ratelimit' } = options;

  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const kv = c.env.KV;

    // Get client identifier (IP address or user ID if authenticated)
    const clientIp = c.req.header('cf-connecting-ip') ||
                     c.req.header('x-forwarded-for')?.split(',')[0] ||
                     'unknown';

    const key = `${keyPrefix}:${clientIp}`;
    const now = Math.floor(Date.now() / 1000);

    try {
      // Get current rate limit info from KV
      const stored = await kv.get(key, 'json') as RateLimitInfo | null;

      let info: RateLimitInfo;

      if (stored && stored.resetAt > now) {
        // Within current window
        info = {
          count: stored.count + 1,
          resetAt: stored.resetAt,
        };
      } else {
        // New window
        info = {
          count: 1,
          resetAt: now + windowSeconds,
        };
      }

      // Store updated info
      await kv.put(key, JSON.stringify(info), {
        expirationTtl: windowSeconds + 60, // Add buffer to TTL
      });

      // Set rate limit headers
      c.header('X-RateLimit-Limit', limit.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, limit - info.count).toString());
      c.header('X-RateLimit-Reset', info.resetAt.toString());

      // Check if rate limit exceeded
      if (info.count > limit) {
        c.header('Retry-After', (info.resetAt - now).toString());
        return c.json(
          {
            error: 'Too many requests',
            retryAfter: info.resetAt - now,
          },
          429
        );
      }
    } catch (error) {
      // If KV fails, allow the request but log the error
      log.error('Rate limit KV error', error instanceof Error ? error : new Error(String(error)), { key });
    }

    await next();
  };
}

/**
 * Stricter rate limit for sensitive endpoints (login, password reset)
 */
export const authRateLimit = rateLimit({
  limit: 5,
  windowSeconds: 60, // 5 requests per minute
  keyPrefix: 'ratelimit:auth',
});

/**
 * Standard rate limit for API endpoints
 */
export const apiRateLimit = rateLimit({
  limit: 100,
  windowSeconds: 60, // 100 requests per minute
  keyPrefix: 'ratelimit:api',
});

/**
 * Lenient rate limit for public/read-only endpoints
 */
export const publicRateLimit = rateLimit({
  limit: 300,
  windowSeconds: 60, // 300 requests per minute
  keyPrefix: 'ratelimit:public',
});
