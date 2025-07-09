import { db } from '$lib/server/db';
import { recipes } from '$lib/server/db/schema.js';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ params }) => {
	const { id } = params;

	if (!id || isNaN(Number(id))) {
		redirect(302, '/');
	}

	const result = await db.query.recipes.findFirst({
		where: eq(recipes.id, Number(id)),
		with: {
			recipeIngredients: {
				with: {
					ingredient: true
				}
			}
		}
	});

	if (!result) {
		redirect(302, '/');
	}

	return { recipe: result };
};
