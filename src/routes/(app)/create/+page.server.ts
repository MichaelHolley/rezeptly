import { OPENROUTER_API_KEY, OPENROUTER_MODEL_NAME } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const imageImportEnabled = Boolean(OPENROUTER_API_KEY) && Boolean(OPENROUTER_MODEL_NAME);

	return {
		features: {
			imageImport: imageImportEnabled
		}
	};
};
