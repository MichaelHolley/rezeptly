import { JWT_SECRET } from '$env/static/private';
import { deleteSessionTokenCookie, sessionCookieName } from '$lib/server/auth/auth';
import type { ROLE } from '$lib/server/auth/permissions';
import { AppError } from '$lib/server/errors';
import { error, redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import jwt from 'jsonwebtoken';

const protectedRoutes = ['/create'];

const handleAuth: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/auth') {
		return await resolve(event);
	}

	const sessionToken = event.cookies.get(sessionCookieName);

	if (sessionToken) {
		try {
			const token = jwt.verify(sessionToken, JWT_SECRET);
			event.locals.roles = (token as { roles: ROLE[] }).roles;
		} catch {
			console.warn('Session token is invalid, deleting cookie and redirecting to /auth');
			deleteSessionTokenCookie(event);
			redirect(307, '/auth');
		}
	} else {
		if (protectedRoutes.includes(event.url.pathname)) {
			redirect(307, `/auth?returnTo=${encodeURIComponent(event.url.pathname)}`);
		}
	}

	return await resolve(event);
};

export const handleError: HandleServerError = async ({ error: err, event, message, status }) => {
	if (err instanceof AppError) {
		console.error(
			`[AppError ${err.statusCode}] ${err.code} at ${event.url.pathname}: ${err.message}`
		);
		error(err.statusCode, { message: err.message, code: err.code, details: err.details });
	}

	console.error(`[Unhandled Error ${status}] at ${event.url.pathname}:`, err);
	error(status || 500, {
		message: message || 'An unexpected error occurred',
		code: 'UNHANDLED_ERROR'
	});
};

export const handle: Handle = sequence(handleAuth);
