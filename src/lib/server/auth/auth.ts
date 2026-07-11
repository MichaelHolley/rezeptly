import { JWT_SECRET } from '$env/static/private';
import { type RequestEvent } from '@sveltejs/kit';
import { createHash, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ADMIN_ROLE } from './permissions';

export const sessionCookieName = 'auth-session';

// Shared between signing and verification so the two never drift apart.
export const SESSION_ISSUER = 'rezeptly';
export const SESSION_ALGORITHM = 'HS256';

const SESSION_DURATION_IN_S = 60 * 60 * 24; // 1 day in seconds
const SESSION_TOKEN_LIFETIME_IN_DAYS = 7;

/**
 * Constant-time comparison of two secrets. Both inputs are hashed to fixed-length
 * buffers first so the comparison never throws on length mismatch and its duration
 * does not leak the secret's length.
 */
export function verifyPassword(candidate: string, expected: string): boolean {
	const candidateHash = createHash('sha256').update(candidate).digest();
	const expectedHash = createHash('sha256').update(expected).digest();
	return timingSafeEqual(candidateHash, expectedHash);
}

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
	// * 1000 to convert to ms
	const expires = new Date(
		Date.now() + SESSION_DURATION_IN_S * SESSION_TOKEN_LIFETIME_IN_DAYS * 1000
	);

	const token = jwt.sign({ app: 'rezeptly', roles: [ADMIN_ROLE] }, JWT_SECRET, {
		expiresIn: `${SESSION_DURATION_IN_S * SESSION_TOKEN_LIFETIME_IN_DAYS}s`,
		issuer: SESSION_ISSUER,
		algorithm: SESSION_ALGORITHM
	});

	return { token, expires };
}
