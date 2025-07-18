import { JWT_SECRET } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export const sessionCookieName = 'auth-session';

const SESSION_DURATION_IN_S = 60 * 60 * 24; // 1 day in seconds

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: true
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

export function generateSessionToken(): { token: string; expires: Date } {
	const expires = new Date(Date.now() + SESSION_DURATION_IN_S * 1000);
	const token = jwt.sign({ app: 'rezeptly' }, JWT_SECRET, {
		expiresIn: `${SESSION_DURATION_IN_S}s`,
		issuer: 'rezeptly'
	});
	return { token, expires };
}
