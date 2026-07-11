import { beforeEach, describe, expect, it } from 'vitest';
import {
	checkRateLimit,
	LOGIN_MAX_ATTEMPTS,
	LOGIN_WINDOW_MS,
	recordFailedAttempt,
	resetAttempts
} from './rateLimiter';

describe('rateLimiter', () => {
	const key = 'test-ip';
	const now = 1_000_000;

	beforeEach(() => {
		resetAttempts(key);
	});

	it('does not limit an unseen key', () => {
		expect(checkRateLimit(key, now)).toEqual({ limited: false, retryAfterMs: 0 });
	});

	it('does not limit while attempts stay below the threshold', () => {
		for (let i = 0; i < LOGIN_MAX_ATTEMPTS - 1; i++) {
			recordFailedAttempt(key, now);
		}
		expect(checkRateLimit(key, now).limited).toBe(false);
	});

	it('limits once the threshold is reached', () => {
		for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) {
			recordFailedAttempt(key, now);
		}
		const result = checkRateLimit(key, now);
		expect(result.limited).toBe(true);
		expect(result.retryAfterMs).toBeGreaterThan(0);
		expect(result.retryAfterMs).toBeLessThanOrEqual(LOGIN_WINDOW_MS);
	});

	it('clears the limit once the window has elapsed', () => {
		for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) {
			recordFailedAttempt(key, now);
		}
		expect(checkRateLimit(key, now).limited).toBe(true);
		expect(checkRateLimit(key, now + LOGIN_WINDOW_MS + 1).limited).toBe(false);
	});

	it('resetAttempts immediately unblocks a limited key', () => {
		for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) {
			recordFailedAttempt(key, now);
		}
		expect(checkRateLimit(key, now).limited).toBe(true);

		resetAttempts(key);
		expect(checkRateLimit(key, now).limited).toBe(false);
	});

	it('starts a fresh window after the previous one expires', () => {
		for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) {
			recordFailedAttempt(key, now);
		}
		// A new failed attempt after expiry opens a new window rather than staying limited.
		const later = now + LOGIN_WINDOW_MS + 1;
		recordFailedAttempt(key, later);
		expect(checkRateLimit(key, later).limited).toBe(false);
	});

	it('keeps keys independent', () => {
		for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i++) {
			recordFailedAttempt('other-ip', now);
		}
		expect(checkRateLimit('other-ip', now).limited).toBe(true);
		expect(checkRateLimit(key, now).limited).toBe(false);
		resetAttempts('other-ip');
	});
});
