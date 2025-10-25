import { command, form, query } from '$app/server';
import { userCanWrite } from '$lib/server/auth';
import * as recipeService from '$lib/server/services';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const getRecipesMetadata = query(async () => {
	return await recipeService.getRecipesMetadata();
});

export const getRecipes = query(async () => {
	return await recipeService.getRecipes();
});

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

export const createRecipe = form(
	z.object({
		name: z.string().nonempty().nonoptional(),
		description: z.string().nonempty().nonoptional(),
		tags: z.array(z.string()).optional()
	}),
	async ({ name, description, tags }) => {
		const recipe = await recipeService.createRecipe({
			name: name.trim(),
			description: description.trim(),
			ingredients: [],
			instructions: [],
			tags: tags?.map((tag) => ({ name: tag.trim() })) ?? []
		});

		redirect(303, `/${recipe.id}`);
	}
);
