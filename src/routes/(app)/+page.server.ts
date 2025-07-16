import { getRecipes } from '$lib/server/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allRecipes = await getRecipes();
	return { recipes: allRecipes };
};
