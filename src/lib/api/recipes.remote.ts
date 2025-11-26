import { command, form, query } from '$app/server';
import { userCanWrite } from '$lib/server/auth/permissions';
import * as recipeService from '$lib/server/services';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const getRecipesMetadata = query(async () => {
	return await recipeService.getRecipesMetadata();
});

export const getAvailableTags = query(async () => {
	return await recipeService.getAllActiveTags();
});

export const getRecipes = query(async () => {
	return await recipeService.getRecipes();
});

export const getRecipeById = query(z.number(), async (id) => {
	const recipe = await recipeService.getRecipeById(id);

	if (!recipe) error(404, 'Recipe not found');

	return recipe;
});

export const deleteRecipe = form(
	z.object({
		recipeId: z.pipe(
			z.string(),
			z.transform((id) => Number(id))
		)
	}),
	async ({ recipeId }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.deleteRecipe(recipeId);

		redirect(303, '/');
	}
);

export const addIngredient = command(
	z.object({
		recipeId: z.pipe(
			z.string(),
			z.transform((id) => Number(id))
		),
		name: z.string().min(1, 'Name is required')
	}),
	async ({ recipeId, name }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.createIngredient({ name: name.trim(), recipeId });

		await getRecipeById(recipeId).refresh();
	}
);

export const removeIngredient = command(
	z.object({
		recipeId: z.number(),
		ingrId: z.number()
	}),
	async ({ recipeId, ingrId }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.deleteIngredient(ingrId);

		await getRecipeById(recipeId).refresh();
	}
);

export const updateRecipeDetails = form(
	z.object({
		recipeId: z.pipe(
			z.string(),
			z.transform((id) => Number(id))
		),
		name: z.string().nonempty().nonoptional(),
		description: z.string().nonempty().nonoptional(),
		tags: z.array(z.string()).optional()
	}),
	async ({ recipeId, name, description, tags }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.updateRecipe(recipeId, {
			name,
			description,
			tags: tags?.map((t) => ({ name: t })) || []
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
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		const recipe = await recipeService.createRecipe({
			name: name.trim(),
			description: description.trim(),
			ingredients: [],
			instructions: [],
			tags: tags?.map((t) => ({ name: t })) || []
		});

		redirect(303, `/${recipe.id}`);
	}
);

export const updateInstructions = form(
	z.object({
		recipeId: z.pipe(
			z.string(),
			z.transform((id) => Number(id))
		),
		instructions: z.array(
			z.object({
				heading: z.string(),
				instructions: z.string()
			})
		)
	}),
	async ({ recipeId, instructions }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.upsertInstructionsForRecipe(
			recipeId,
			instructions.map((item, i) => ({
				...item,
				stepOrder: i + 1,
				recipeId
			}))
		);

		await getRecipeById(recipeId).refresh();
	}
);
