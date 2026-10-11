import { getRoles } from '#lib/server/auth/permissions.js';
import { aiEnabled, imageGenerationEnabled } from '#lib/server/services/ai.service.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		roles: getRoles() ?? [],
		features: {
			imageImport: aiEnabled(),
			imageGeneration: imageGenerationEnabled(),
			tagSuggestions: aiEnabled(),
			recipeAssistant: aiEnabled()
		}
	};
};
