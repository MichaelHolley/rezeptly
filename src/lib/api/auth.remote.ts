import { command, form, getRequestEvent } from '$app/server';
import { AUTH_PASSWORD } from '$app/env/private';
import {
	deleteSessionTokenCookie,
	generateSessionToken,
	setSessionTokenCookie,
	verifyPassword
} from '#lib/server/auth/auth.js';
import { ADMIN_ROLE } from '#lib/server/auth/permissions.js';
import {
	checkRateLimit,
	recordFailedAttempt,
	resetAttempts
} from '#lib/server/auth/rateLimiter.js';
import { safeRedirectPath } from '#lib/server/auth/safe-redirect.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const logout = command(async () => {
	const event = getRequestEvent();
	deleteSessionTokenCookie(event);
	event.locals.roles = [];

	return { success: true };
});

export const login = form(
	z.object({
		password: z.string().min(1, 'Password is required'),
		returnTo: z.string().optional()
	}),
	async ({ password, returnTo }) => {
		const event = getRequestEvent();
		const clientKey = event.getClientAddress();

		const { limited, retryAfterMs } = checkRateLimit(clientKey);
		if (limited) {
			const retryAfterMinutes = Math.ceil(retryAfterMs / 60_000);
			error(
				429,
				`Too many login attempts. Try again in ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? '' : 's'}.`,
				{ code: 'RATE_LIMITED' }
			);
		}

		if (!verifyPassword(password, AUTH_PASSWORD)) {
			recordFailedAttempt(clientKey);
			error(401, 'Invalid password', { code: 'INVALID_CREDENTIALS' });
		}

		resetAttempts(clientKey);

		const { token, expires } = generateSessionToken();
		setSessionTokenCookie(event, token, expires);
		event.locals.roles = [ADMIN_ROLE];

		redirect(303, safeRedirectPath(returnTo));
	}
);
