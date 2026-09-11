import { userCanWrite } from '$lib/server/auth/permissions';
import * as recipeService from '$lib/server/services/recipe.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const recipe = await recipeService.getRecipeBySlug(params.slug, {
		includeDrafts: userCanWrite()
	});

	return {
		meta: {
			title: recipe.name,
			description: recipe.description ?? `${recipe.name} recipe on rezeptly`,
			imageUrl: recipe.imageUrl
		}
	};
};
