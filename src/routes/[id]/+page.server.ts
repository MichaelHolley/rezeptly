import { createIngredient, deleteIngredient } from '$lib/server/services';
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
	},
	addIngredient: async (event) => {
		const { id } = event.params;

		if (!id || isNaN(Number(id))) {
			return { status: 400 };
		}

		const formData = await event.request.formData();
		const name = formData.get('name');

		if (!name) {
			return { status: 400, message: 'Name is required' };
		}

		await createIngredient({
			name: name as string,
			recipeId: Number(id)
		});

		return { status: 200 };
	},
	deleteIngredient: async (event) => {
		const { id } = event.params;

		if (!id || isNaN(Number(id))) {
			return { status: 400 };
		}

		const formData = await event.request.formData();
		const ingrId = formData.get('id') as string;

		if (!ingrId) {
			return { status: 400 };
		}

		await deleteIngredient(Number(ingrId));

		return { status: 200 };
	}
};
