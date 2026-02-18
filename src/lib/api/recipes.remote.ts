import { command, form, query } from '$app/server';
import { userCanWrite } from '$lib/server/auth/permissions';
import { PermissionError, ValidationError } from '$lib/server/errors';
import * as imageService from '$lib/server/services/image.service';
import * as ingredientService from '$lib/server/services/ingredient.service';
import * as instructionService from '$lib/server/services/instruction.service';
import * as recipeService from '$lib/server/services/recipe.service';
import { redirect } from '@sveltejs/kit';
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
	return recipe;
});

export const getRecipeBySlug = query(z.string(), async (slug) => {
	const recipe = await recipeService.getRecipeBySlug(slug);
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
		if (!userCanWrite()) {
			throw new PermissionError();
		}

		await recipeService.deleteRecipe(recipeId);

		redirect(303, '/');
	}
);

export const addIngredient = form(
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
		if (!userCanWrite()) {
			throw new PermissionError();
		}

		await ingredientService.createIngredient({ name: name.trim(), recipeId });

		await getRecipeById(recipeId).refresh();
	}
);

export const removeIngredient = command(
	z.object({
		recipeId: z.number(),
		ingrId: z.number()
	}),
	async ({ recipeId, ingrId }) => {
		if (!userCanWrite()) {
			throw new PermissionError();
		}

		await ingredientService.deleteIngredient(ingrId);

		await getRecipeById(recipeId).refresh();
	}
);

export const editIngredient = form(
	z.object({
		recipeId: z
			.pipe(
				z.string(),
				z.transform((id) => Number(id))
			)
			.or(z.number()),
		ingrId: z
			.pipe(
				z.string(),
				z.transform((id) => Number(id))
			)
			.or(z.number()),
		name: z.string().min(1, 'Name is required')
	}),
	async ({ recipeId, ingrId, name }) => {
		if (!userCanWrite()) {
			throw new PermissionError();
		}

		await ingredientService.updateIngredient(ingrId, name.trim());

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
		if (!userCanWrite()) {
			throw new PermissionError();
		}

		await recipeService.updateRecipe(recipeId, {
			name,
			description,
			imageUrl,
			tags: tags?.map((t) => ({ name: t })) || []
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
		if (!userCanWrite()) {
			throw new PermissionError();
		}

		const recipe = await recipeService.createRecipe({
			name: name.trim(),
			description: description.trim(),
			imageUrl,
			ingredients: [],
			instructions: [],
			tags: tags?.map((t) => ({ name: t })) || []
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
		if (!userCanWrite()) {
			throw new PermissionError();
		}

		await instructionService.upsertInstructionsForRecipe(
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
		if (!userCanWrite()) {
			throw new PermissionError();
		}

		const url = await imageService.uploadImage(file);
		await recipeService.updateRecipe(recipeId, { imageUrl: url });

		await getRecipeById(recipeId).refresh();

		return { url };
	}
);

export const deleteRecipeImage = command(z.number(), async (recipeId) => {
	if (!userCanWrite()) {
		throw new PermissionError();
	}

	const recipe = await recipeService.getRecipeById(recipeId);

	if (!recipe.imageUrl) {
		throw new ValidationError('Recipe does not have an image to delete');
	}

	await imageService.deleteImage(recipe.imageUrl);
	await recipeService.updateRecipe(recipeId, { imageUrl: null });

	await getRecipeById(recipeId).refresh();

	return { success: true };
});
