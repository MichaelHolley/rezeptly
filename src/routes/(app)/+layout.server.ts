import { OPENROUTER_API_KEY, OPENROUTER_MODEL_NAME } from '$env/static/private';
import { getRoles } from '$lib/server/auth/permissions';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	const roles = getRoles();
	return {
		roles: roles ?? [],
		features: {
			imageImport: Boolean(OPENROUTER_API_KEY) && Boolean(OPENROUTER_MODEL_NAME)
		}
	};
};
