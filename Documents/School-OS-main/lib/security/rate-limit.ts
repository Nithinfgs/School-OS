/**
 * High-performance sliding-window in-memory rate limiter for SchoolOS API routes.
 * Protects public and sensitive endpoints against brute-force, DDoS, and spam.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired rate limit buckets to prevent memory leaks (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Extracts client IP safely across Cloudflare, Netlify, Vercel, and standard reverse proxies.
 */
export function extractClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-client-ip') ||
    '127.0.0.1'
  );
}

/**
 * Checks and increments rate limit for a specific key (e.g. `login:192.168.1.1`).
 * Returns an object with allowed status, remaining count, and reset time in seconds.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60_000 }
): {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    resetSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
  };
}

/**
 * Helper to generate a standardized HTTP 429 Too Many Requests response with proper headers.
 */
export function rateLimitExceededResponse(resetSeconds: number): Response {
  return Response.json(
    {
      error: 'TOO_MANY_REQUESTS',
      message: `Rate limit exceeded. Please retry after ${resetSeconds} second${resetSeconds === 1 ? '' : 's'}.`,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(resetSeconds),
        'X-RateLimit-Reset': String(resetSeconds),
        'Cache-Control': 'no-store, no-cache',
      },
    }
  );
}
