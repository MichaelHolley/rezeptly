import { command, getRequestEvent, query } from '$app/server';
import { deleteSessionTokenCookie } from '$lib/server/auth/auth';
import { getRoles } from '$lib/server/auth/permissions';

export const getUserRoles = query(async () => {
	return getRoles();
});

export const logout = command(async () => {
	const event = await getRequestEvent();
	deleteSessionTokenCookie(event);

	return { redirect: true };
});
