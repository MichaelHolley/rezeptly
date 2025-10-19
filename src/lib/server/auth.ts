import { JWT_SECRET } from '$env/static/private';
import { type RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export const sessionCookieName = 'auth-session';

export const ADMIN_ROLE = 'admin';
export const USER_ROLE = 'user';
export type ROLE = typeof ADMIN_ROLE | typeof USER_ROLE;

const SESSION_DURATION_IN_S = 60 * 60 * 24; // 1 day in seconds
const SESSION_TOKEN_LIFETIME_IN_DAYS = 7;

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

export function generateSessionToken(admin: boolean = false): { token: string; expires: Date } {
	// * 1000 to convert to ms
	const expires = new Date(
		Date.now() + SESSION_DURATION_IN_S * SESSION_TOKEN_LIFETIME_IN_DAYS * 1000
	);

	const token = jwt.sign(
		{ app: 'rezeptly', roles: admin ? [ADMIN_ROLE] : [USER_ROLE] },
		JWT_SECRET,
		{
			expiresIn: `${SESSION_DURATION_IN_S * SESSION_TOKEN_LIFETIME_IN_DAYS}s`,
			issuer: 'rezeptly'
		}
	);
	return { token, expires };
}

export function isAdmin(roles: ROLE[]): boolean {
	return roles.includes(ADMIN_ROLE);
}
