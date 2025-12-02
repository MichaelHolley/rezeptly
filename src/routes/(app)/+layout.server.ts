import { getRoles } from '$lib/server/auth/permissions';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	const roles = getRoles();
	return { roles: roles ?? [] };
};
