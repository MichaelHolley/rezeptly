import { createRecipe } from '$lib/server/services/recipe.service.js';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();

		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		if (!name) {
			return fail(400, {
				name,
				description,
				error: 'Name is required'
			});
		}

		try {
			const recipe = await createRecipe({
				name,
				description,
				ingredients: [],
				instructions: []
			});
			return redirect(302, `/${recipe.id}`);
		} catch (e) {
			return fail(500, {
				name,
				description,
				error: 'Failed to create recipe'
			});
		}
	}
};
