import { createRecipeWithoutIngredients } from '$lib/server/services/recipe.service.js';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();

		const recipe = await createRecipeWithoutIngredients({
			name: formData.get('name') as string,
			description: formData.get('description') as string
		});

		return redirect(302, `/${recipe.id}`);
	}
};
