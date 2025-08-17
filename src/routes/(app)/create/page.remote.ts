import { form } from '$app/server';
import { createRecipe } from '$lib/server/services';
import { fail, redirect } from '@sveltejs/kit';

export const createNewRecipe = form(async (data) => {
	const name = data.get('name') as string;
	const description = data.get('description') as string;

	if (!name) {
		return fail(400, {
			name,
			description,
			error: 'Name is required'
		});
	}

	const recipe = await createRecipe({
		name: name.trim(),
		description: description.trim(),
		ingredients: [],
		instructions: []
	});

	return redirect(303, `/${recipe.id}`);
});
