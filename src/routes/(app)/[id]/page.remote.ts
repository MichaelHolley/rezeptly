import { command, form, query } from '$app/server';
import { userCanWrite } from '$lib/server/auth';
import * as recipeService from '$lib/server/services';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export const getRecipeById = query(z.number(), async (id) => {
	const recipe = await recipeService.getRecipeById(id);

	if (!recipe) error(404, 'Recipe not found');

	return recipe;
});

export const deleteRecipe = command(z.number(), async (id) => {
	if (!userCanWrite()) error(403, 'Insufficient Permissions');

	await recipeService.deleteRecipe(id);
});

export const addIngredient = form(
	z.object({
		recipeId: z.transform(Number),
		name: z.string().min(1, 'Name is required')
	}),
	async ({ recipeId, name }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.createIngredient({ name: name.trim(), recipeId });

		await getRecipeById(recipeId).refresh();
	}
);

export const removeIngredient = command(
	z.object({ recipeId: z.number(), ingrId: z.number() }),
	async ({ recipeId, ingrId }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.deleteIngredient(ingrId);

		await getRecipeById(recipeId).refresh();
	}
);

export const updateRecipeDetails = form(
	z.object({
		recipeId: z.transform(Number),
		name: z.string().nonempty().nonoptional(),
		description: z.string().nonempty().nonoptional(),
		tags: z.array(z.string()).optional()
	}),
	async ({ recipeId, name, description, tags }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.updateRecipe(recipeId, {
			name,
			description,
			tags: tags?.map((tag) => ({ name: tag.trim() })) ?? []
		});

		await getRecipeById(recipeId).refresh();
	}
);
