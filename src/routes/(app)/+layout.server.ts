import { aiEnabled } from '$lib/server/services/ai.service';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		features: {
			imageImport: aiEnabled(),
			tagSuggestions: aiEnabled()
		}
	};
};
