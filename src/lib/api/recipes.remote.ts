import { command, form, query } from '$app/server';
import { userCanWrite } from '$lib/server/auth/permissions';
import * as recipeService from '$lib/server/services';
import { mapTags } from '$lib/server/utils';
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
		recipeId: z
			.pipe(
				z.string(),
				z.transform((id) => Number(id))
			)
			.or(z.number())
	}),
	async ({ recipeId }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.deleteRecipe(recipeId);

		redirect(303, '/');
	}
);

export const addIngredient = command(
	z.object({
		recipeId: z
			.pipe(
				z.string(),
				z.transform((id) => Number(id))
			)
			.or(z.number()),
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
		recipeId: z
			.pipe(
				z.string(),
				z.transform((id) => Number(id))
			)
			.or(z.number()),
		name: z.string().nonempty().nonoptional(),
		description: z.string().nonempty().nonoptional(),
		tags: z.array(z.string()).optional(),
		imageUrl: z.string().optional()
	}),
	async ({ recipeId, name, description, tags, imageUrl }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		await recipeService.updateRecipe(recipeId, {
			name,
			description,
			imageUrl,
			tags: mapTags(tags)
		});

		await getRecipeById(recipeId).refresh();
	}
);

export const createRecipe = form(
	z.object({
		name: z.string().nonempty().nonoptional(),
		description: z.string().nonempty().nonoptional(),
		tags: z.array(z.string()).optional(),
		imageUrl: z.string().optional()
	}),
	async ({ name, description, tags, imageUrl }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		const recipe = await recipeService.createRecipe({
			name: name.trim(),
			description: description.trim(),
			imageUrl,
			ingredients: [],
			instructions: [],
			tags: mapTags(tags)
		});

		redirect(303, `/${recipe.id}`);
	}
);

export const updateInstructions = form(
	z.object({
		recipeId: z
			.pipe(
				z.string(),
				z.transform((id) => Number(id))
			)
			.or(z.number()),
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

export const uploadRecipeImage = form(
	z.object({
		recipeId: z
			.pipe(
				z.string(),
				z.transform((id) => Number(id))
			)
			.or(z.number()),
		file: z.instanceof(File)
	}),
	async ({ recipeId, file }) => {
		if (!userCanWrite()) error(403, 'Insufficient Permissions');

		try {
			const url = await recipeService.uploadImage(file);

			await recipeService.updateRecipe(recipeId, { imageUrl: url });

			await getRecipeById(recipeId).refresh();

			return { url };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to upload image';
			error(400, message);
		}
	}
);

export const deleteRecipeImage = command(z.number(), async (recipeId) => {
	if (!userCanWrite()) error(403, 'Insufficient Permissions');

	const recipe = await recipeService.getRecipeById(recipeId);

	if (!recipe) {
		error(404, 'Recipe not found');
	}

	if (!recipe.imageUrl) {
		error(400, 'Recipe does not have an image to delete');
	}

	await recipeService.deleteImage(recipe.imageUrl);
	await recipeService.updateRecipe(recipeId, { imageUrl: null });

	await getRecipeById(recipeId).refresh();

	return { success: true };
});
