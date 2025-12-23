import { command, form, getRequestEvent, query } from '$app/server';
import { AUTH_PASSWORD } from '$env/static/private';
import {
	deleteSessionTokenCookie,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/auth/auth';
import { getRoles } from '$lib/server/auth/permissions';
import { PermissionError } from '$lib/server/errors';
import { redirect } from '@sveltejs/kit';
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
		if (password !== AUTH_PASSWORD) {
			throw new PermissionError('Incorrect password');
		}

		const event = getRequestEvent();
		const { token, expires } = generateSessionToken();
		setSessionTokenCookie(event, token, expires);

		redirect(303, returnTo || '/');
	}
);
