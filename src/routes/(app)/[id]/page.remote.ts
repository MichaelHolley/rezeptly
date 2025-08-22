import { command, query } from '$app/server';
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

// TODO not used yet
// export const addIngredient = command(
// 	z.object({ recipeId: z.number(), name: z.string() }),
// 	async ({ recipeId, name }) => {
// 		await recipeService.createIngredient({ name, recipeId });

// 		getRecipeById(recipeId).refresh();
// 	}
// );

export const removeIngredient = command(
	z.object({ recipeId: z.number(), ingrId: z.number() }),
	async ({ recipeId, ingrId }) => {
		await recipeService.deleteIngredient(ingrId);

		getRecipeById(recipeId).refresh();
	}
);
