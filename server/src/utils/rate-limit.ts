/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Intended for protecting CPU-intensive endpoints (signin, signup, otp) from
 * abuse. Each unique `key` (e.g. IP + route) gets an independent counter that
 * resets after `windowMs` milliseconds.
 *
 * NOTE: This is per-process. If you run multiple instances behind a load
 * balancer you'll need a shared store (e.g. Redis) instead.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Periodically sweep expired entries so the Map doesn't grow unboundedly.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 60_000);

/**
 * Returns `true` if the request is within the allowed rate.
 * Returns `false` (and does NOT increment the counter) when the limit has
 * already been exceeded.
 *
 * @param key       Unique identifier for the caller (e.g. `"signin:127.0.0.1"`)
 * @param max       Maximum number of requests allowed per window
 * @param windowMs  Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count += 1;
  return true;
}
