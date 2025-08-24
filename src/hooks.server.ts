import { JWT_SECRET } from '$env/static/private';
import * as auth from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import jwt from 'jsonwebtoken';

const handleAuth: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/auth') {
		return await resolve(event);
	}

	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		console.warn('No session token found, redirecting to /auth');
		return redirect(303, `/auth`);
	}

	try {
		jwt.verify(sessionToken, JWT_SECRET);
	} catch {
		console.warn('Session token is invalid, deleting cookie and redirecting to /auth');
		auth.deleteSessionTokenCookie(event);
		return redirect(303, `/auth`);
	}

	return await resolve(event);
};

export const handle: Handle = sequence(handleAuth);
