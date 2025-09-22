import { command, form, query } from '$app/server';
import * as recipeService from '$lib/server/services';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

export const getRecipeById = query(z.number(), async (id) => {
	const recipe = await recipeService.getRecipeById(id);

	if (!recipe) fail(404, 'Recipe not found');

	return recipe;
});

export const deleteRecipe = command(z.number(), async (id) => {
	await recipeService.deleteRecipe(id);
});

export const addIngredient = form(
	z.object({
		recipeId: z.transform(Number),
		name: z.string().min(1, 'Name is required')
	}),
	async ({ recipeId, name }) => {
		await recipeService.createIngredient({ name: name.trim(), recipeId });

		await getRecipeById(recipeId).refresh();
	}
);

export const removeIngredient = command(
	z.object({ recipeId: z.number(), ingrId: z.number() }),
	async ({ recipeId, ingrId }) => {
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
		await recipeService.updateRecipe(recipeId, {
			name,
			description,
			tags: tags?.map((tag) => ({ name: tag.trim() })) ?? []
		});

		await getRecipeById(recipeId).refresh();
	}
);
