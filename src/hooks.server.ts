import { redirect } from '@sveltejs/kit';
import { JWT_SECRET } from '$app/env/private';
import {
	deleteSessionTokenCookie,
	SESSION_ALGORITHM,
	SESSION_ISSUER,
	sessionCookieName
} from '#lib/server/auth/auth.js';
import type { ROLE } from '#lib/server/auth/permissions.js';
import { sequence, type Handle, type HandleServerError } from '@sveltejs/kit/hooks';
import jwt from 'jsonwebtoken';

const protectedRoutes = ['/create', '/drafts', '/import', '/tags'];

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(sessionCookieName);
	let authenticated = false;

	if (sessionToken) {
		try {
			const token = jwt.verify(sessionToken, JWT_SECRET, {
				algorithms: [SESSION_ALGORITHM],
				issuer: SESSION_ISSUER
			});
			event.locals.roles = (token as { roles: ROLE[] }).roles;
			authenticated = true;
		} catch {
			console.warn('Session token is invalid, deleting cookie');
			deleteSessionTokenCookie(event);
		}
	}

	if (!authenticated && protectedRoutes.includes(event.url.pathname)) {
		redirect(307, `/auth?returnTo=${encodeURIComponent(event.url.pathname)}`);
	}

	return await resolve(event);
};

export const handle: Handle = sequence(handleAuth);

export const handleError: HandleServerError = ({ kind, error }) => {
	if (kind === 'app') return error;
	if (kind === 'validation') return { message: 'Invalid request', code: 'VALIDATION_ERROR' };

	console.error(error);
	return { message: 'Something went wrong', code: 'UNHANDLED_ERROR' };
};
