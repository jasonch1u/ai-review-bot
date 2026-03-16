type RateLimitEntry = {
  readonly count: number;
  readonly resetAt: number;
};

// In-memory store — reset on deploy, sufficient for MVP
const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30; // per window per key

/**
 * Simple sliding-window rate limiter.
 * Returns true if the request is allowed, false if it should be rejected.
 */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  store.set(key, { ...entry, count: entry.count + 1 });
  return true;
}
