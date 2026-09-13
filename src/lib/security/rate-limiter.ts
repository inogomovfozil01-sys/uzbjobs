export interface RateLimitConfig {
  limit: number; // max requests
  windowMs: number; // in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

// In-memory bucket store
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, TokenBucket>();

// Periodic cleanup of stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store.entries()) {
      if (now - bucket.lastRefill > 600000) {
        // older than 10 mins
        store.delete(key);
      }
    }
  }, 300000);
}

export const RATE_LIMITS = {
  SEARCH_GUEST: { limit: 30, windowMs: 60 * 1000 },
  SEARCH_USER: { limit: 60, windowMs: 60 * 1000 },
  AI_GUEST: { limit: 5, windowMs: 60 * 1000 },
  AI_USER: { limit: 20, windowMs: 60 * 1000 },
  AI_ADMIN: { limit: 120, windowMs: 60 * 1000 },
  AUTH: { limit: 10, windowMs: 60 * 1000 },
  REPORTS: { limit: 10, windowMs: 60 * 1000 },
  ADMIN_ACTIONS: { limit: 120, windowMs: 60 * 1000 },
};

/**
 * Token bucket rate limiter.
 * @param identifier Unique client ID (e.g. IP address or userId)
 * @param prefix Action/endpoint category (e.g. "search", "ai")
 * @param config { limit, windowMs }
 */
export function checkRateLimit(
  identifier: string,
  prefix: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${prefix}:${identifier}`;
  const now = Date.now();

  const bucket = store.get(key) || {
    tokens: config.limit,
    lastRefill: now,
  };

  // Calculate elapsed time and add tokens proportionally
  const elapsed = now - bucket.lastRefill;
  if (elapsed > 0) {
    const refillRate = config.limit / config.windowMs;
    const tokensToAdd = elapsed * refillRate;
    bucket.tokens = Math.min(config.limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    store.set(key, bucket);
    return {
      success: true,
      limit: config.limit,
      remaining: Math.floor(bucket.tokens),
      resetAt: Math.ceil(now + ((config.limit - bucket.tokens) / (config.limit / config.windowMs))),
    };
  }

  store.set(key, bucket);
  const timeToWait = Math.ceil((1 - bucket.tokens) / (config.limit / config.windowMs));
  return {
    success: false,
    limit: config.limit,
    remaining: 0,
    resetAt: now + timeToWait,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
