import { db } from '$lib/server/db';
import { recipes } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ params }) => {
	const { id } = params;

	if (!id || isNaN(Number(id))) {
		redirect(302, '/');
	}

	const recipe = await db
		.select()
		.from(recipes)
		.where(eq(recipes.id, Number(id)));

	if (!recipe || recipe.length === 0 || !recipe[0]) {
		redirect(302, '/');
	}

	return { recipe: recipe[0] };
};
