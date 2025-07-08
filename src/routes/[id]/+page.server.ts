import { db } from '$lib/server/db';
import { recipes } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load = async ({ params }) => {
	const { id } = params;

	if (!id || isNaN(Number(id))) {
		return { recipe: null };
	}

	const recipe = await db
		.select()
		.from(recipes)
		.where(eq(recipes.id, Number(id)));

	return { recipe: recipe[0] || null };
};
