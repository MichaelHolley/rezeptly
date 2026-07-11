import { command, form, getRequestEvent, query } from '$app/server';
import { AUTH_PASSWORD } from '$env/static/private';
import {
	deleteSessionTokenCookie,
	generateSessionToken,
	setSessionTokenCookie,
	verifyPassword
} from '$lib/server/auth/auth';
import { getRoles } from '$lib/server/auth/permissions';
import { checkRateLimit, recordFailedAttempt, resetAttempts } from '$lib/server/auth/rateLimiter';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const getUserRoles = query(async () => {
	return getRoles() || [];
});

export const logout = command(async () => {
	const event = getRequestEvent();
	deleteSessionTokenCookie(event);

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
			error(429, {
				message: `Too many login attempts. Try again in ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? '' : 's'}.`,
				code: 'RATE_LIMITED'
			});
		}

		if (!verifyPassword(password, AUTH_PASSWORD)) {
			recordFailedAttempt(clientKey);
			error(401, { message: 'Invalid password', code: 'INVALID_CREDENTIALS' });
		}

		resetAttempts(clientKey);

		const { token, expires } = generateSessionToken();
		setSessionTokenCookie(event, token, expires);

		redirect(303, returnTo || '/');
	}
);
