import { query } from '$app/server';
import { getRoles } from '$lib/server/auth';

export const getUserRoles = query(async () => {
	return getRoles();
});
