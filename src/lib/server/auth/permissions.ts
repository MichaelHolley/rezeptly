import { getRequestEvent, query } from '$app/server';
import { redirect } from '@sveltejs/kit';

export const ADMIN_ROLE = 'admin';
export type ROLE = typeof ADMIN_ROLE; // | typeof ANOTHER_ROLE

export function getRoles() {
	const { locals } = getRequestEvent();
	return locals.roles;
}

export function userCanWrite(): boolean {
	const roles = getRoles();
	return roles.includes(ADMIN_ROLE);
}

export const guardedQuery = <T>(fn: () => T) => {
	return query(() => {
		if (!userCanWrite()) {
			redirect(307, '/auth');
		}

		return fn();
	});
};
