import * as auth from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	console.log(sessionToken);

	return await resolve(event);
};

export const handle: Handle = sequence(handleAuth);
