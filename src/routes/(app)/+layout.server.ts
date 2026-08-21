import { getRoles } from '$lib/server/auth/permissions';
import { aiEnabled } from '$lib/server/services/ai.service';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	const roles = getRoles();
	return {
		roles: roles ?? [],
		features: {
			imageImport: aiEnabled(),
			tagSuggestions: aiEnabled()
		}
	};
};
