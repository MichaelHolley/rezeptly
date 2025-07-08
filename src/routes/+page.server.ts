import { db } from '$lib/server/db';
import { recipes } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allRecipes = await db.select().from(recipes);
	return { recipes: allRecipes };
};
