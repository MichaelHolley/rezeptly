import { command, query } from '$app/server';
import * as recipeService from '$lib/server/services';
import { z } from 'zod';

export const deleteRecipe = command(z.number(), async (id) => {
	if (!id || isNaN(Number(id))) {
		return fail(400);
	}

	await recipeService.deleteRecipe(id);
});

export const removeIngredient = command(
	z.object({ recipeId: z.number(), ingrId: z.number() }),
	async ({ recipeId, ingrId }) => {
		await recipeService.deleteIngredient(ingrId);

		getRecipeById(recipeId).refresh();
	}
);
