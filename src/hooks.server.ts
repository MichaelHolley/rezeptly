import { JWT_SECRET } from '$env/static/private';
import { deleteSessionTokenCookie, sessionCookieName } from '$lib/server/auth/auth';
import type { ROLE } from '$lib/server/auth/permissions';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import jwt from 'jsonwebtoken';

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
	}

	return await resolve(event);
};

export const handle: Handle = sequence(handleAuth);
