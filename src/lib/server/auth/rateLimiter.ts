/**
 * Simple in-memory fixed-window rate limiter used to throttle login attempts.
 *
 * NOTE: state lives in the memory of a single server instance. In a serverless or
 * multi-instance deployment (e.g. Vercel) this is a best-effort baseline rather than
 * a hard guarantee — an attacker spread across instances gets a separate budget per
 * instance. It still meaningfully raises the cost of brute-forcing the shared
 * password. For strong guarantees, back this with a shared store (Redis / Postgres).
 */

export const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const LOGIN_MAX_ATTEMPTS = 5;

// Guards against unbounded memory growth from many distinct keys (e.g. spoofed IPs).
const MAX_TRACKED_KEYS = 10_000;

type Attempt = { count: number; expiresAt: number };

const attempts = new Map<string, Attempt>();

/**
 * Drops keys whose window has elapsed, capping map growth.
 *
 * @param now - Current time in epoch ms.
 */
function prune(now: number): void {
	for (const [key, attempt] of attempts) {
		if (attempt.expiresAt <= now) {
			attempts.delete(key);
		}
	}
}

export type RateLimitResult = { limited: boolean; retryAfterMs: number };

/**
 * Reports whether a key is over its budget, without mutating state.
 *
 * @param key - Caller identifier (e.g. client IP).
 * @param now - Current time in epoch ms; defaults to `Date.now()`.
 * @returns `limited` plus `retryAfterMs` of lockout remaining (0 when not limited).
 */
export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult {
	const attempt = attempts.get(key);

	if (!attempt || attempt.expiresAt <= now) {
		return { limited: false, retryAfterMs: 0 };
	}

	if (attempt.count >= LOGIN_MAX_ATTEMPTS) {
		return { limited: true, retryAfterMs: attempt.expiresAt - now };
	}

	return { limited: false, retryAfterMs: 0 };
}

/**
 * Records one failed attempt, opening a new window if none is active.
 *
 * @param key - Caller identifier (e.g. client IP).
 * @param now - Current time in epoch ms; defaults to `Date.now()`.
 */
export function recordFailedAttempt(key: string, now: number = Date.now()): void {
	if (attempts.size >= MAX_TRACKED_KEYS) {
		prune(now);
	}

	const attempt = attempts.get(key);

	if (!attempt || attempt.expiresAt <= now) {
		attempts.set(key, { count: 1, expiresAt: now + LOGIN_WINDOW_MS });
		return;
	}

	attempt.count += 1;
}

/**
 * Clears a key's attempts, restoring its full budget (call on successful login).
 *
 * @param key - Caller identifier (e.g. client IP).
 */
export function resetAttempts(key: string): void {
	attempts.delete(key);
}
