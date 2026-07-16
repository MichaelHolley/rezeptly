import { JWT_SECRET } from '$env/static/private';
import {
	deleteSessionTokenCookie,
	SESSION_ALGORITHM,
	SESSION_ISSUER,
	sessionCookieName
} from '$lib/server/auth/auth';
import type { ROLE } from '$lib/server/auth/permissions';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import jwt from 'jsonwebtoken';

const protectedRoutes = ['/create'];

// Public, session-less endpoints: an invalid cookie must not turn these into an /auth redirect.
const unauthenticatedRoutes = ['/auth', '/api/mcp'];

const handleAuth: Handle = async ({ event, resolve }) => {
	if (unauthenticatedRoutes.includes(event.url.pathname)) {
		return await resolve(event);
	}

	const sessionToken = event.cookies.get(sessionCookieName);

	if (sessionToken) {
		try {
			const token = jwt.verify(sessionToken, JWT_SECRET, {
				algorithms: [SESSION_ALGORITHM],
				issuer: SESSION_ISSUER
			});
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

export const handle: Handle = sequence(handleAuth);
