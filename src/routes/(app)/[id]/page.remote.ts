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

export const addIngredient = form(async (data) => {
	const recipeId = Number(data.get('recipeId'));
	const name = data.get('name') as string;

	await recipeService.createIngredient({ name, recipeId });

	await getRecipeById(recipeId).refresh();
});

export const removeIngredient = command(
	z.object({ recipeId: z.number(), ingrId: z.number() }),
	async ({ recipeId, ingrId }) => {
		await recipeService.deleteIngredient(ingrId);

		await getRecipeById(recipeId).refresh();
	}
);

export const updateRecipeDetails = form(async (data) => {
	const recipeId = Number(data.get('recipeId'));
	const name = data.get('name') as string;
	const description = data.get('description') as string;

	await recipeService.updateRecipe(recipeId, { name, description });

	await getRecipeById(recipeId).refresh();
});
