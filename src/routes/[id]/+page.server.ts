import { deleteRecipe, getRecipeById } from '$lib/server/services/recipe.service.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const { id } = params;

	if (!id || isNaN(Number(id))) {
		redirect(302, '/');
	}

	const recipe = await getRecipeById(Number(id));

	if (!recipe) {
		redirect(302, '/');
	}

	return { recipe };
};

export const actions = {
	delete: async (event) => {
		const { id } = event.params;

		if (!id || isNaN(Number(id))) {
			return { status: 400 };
		}

		await deleteRecipe(Number(id));

		return redirect(302, '/');
	}
};
