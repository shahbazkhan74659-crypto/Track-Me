// In-memory login-attempt limiter, keyed per IP. Good enough for this app's
// single-process Render deployment; resets on restart/redeploy, which is
// an acceptable tradeoff for a personal, single-account app.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const entry = attempts.get(key);
  const now = Date.now();
  if (!entry || now > entry.resetAt) {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  return { allowed: entry.count < MAX_ATTEMPTS, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function resetRateLimit(key: string): void {
  attempts.delete(key);
}
