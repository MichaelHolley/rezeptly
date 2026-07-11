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

function prune(now: number): void {
	for (const [key, attempt] of attempts) {
		if (attempt.expiresAt <= now) {
			attempts.delete(key);
		}
	}
}

export type RateLimitResult = { limited: boolean; retryAfterMs: number };

/**
 * Returns whether the given key is currently rate limited without recording an attempt.
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
 * Records a failed attempt for the given key, opening a new window if none is active.
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
 * Clears any tracked attempts for the given key (call after a successful login).
 */
export function resetAttempts(key: string): void {
	attempts.delete(key);
}
