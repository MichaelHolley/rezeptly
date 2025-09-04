import { form } from '$app/server';
import * as recipeService from '$lib/server/services';
import { fail, redirect } from '@sveltejs/kit';

export const createRecipe = form(async (data) => {
	const name = data.get('name') as string;
	const description = data.get('description') as string;
	const tags = data.getAll('tags[]') as string[];

	if (!name) {
		return fail(400, {
			name,
			description,
			error: 'Name is required'
		});
	}

	const recipe = await recipeService.createRecipe({
		name: name.trim(),
		description: description.trim(),
		ingredients: [],
		instructions: [],
		tags: tags.map((tag) => ({ name: tag.trim() }))
	});

	redirect(303, `/${recipe.id}`);
});
