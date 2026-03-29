import { command, form, query } from '$app/server';
import { userCanWrite } from '$lib/server/auth/permissions';
import * as imageService from '$lib/server/services/image.service';
import * as ingredientService from '$lib/server/services/ingredient.service';
import * as instructionService from '$lib/server/services/instruction.service';
import * as recipeService from '$lib/server/services/recipe.service';
import * as tagService from '$lib/server/services/tag.service';
import type { TagCategory, TagInput } from '$lib/server/types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { throwNewPermissionError } from '../server/error';

function buildTagInputs(input: Partial<Record<TagCategory, string[]>>): TagInput[] {
	return (Object.entries(input) as [TagCategory, string[]][]).flatMap(([category, names]) =>
		(names ?? []).map((name) => ({ name, category }))
	);
}

export const getRecipesMetadata = query(async () => {
	return await recipeService.getRecipesMetadata();
});

export const getAvailableTags = query(async () => {
	return await tagService.getAllActiveTags();
});

export const getRecipes = query(async () => {
	return await recipeService.getRecipes();
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
			throwNewPermissionError();
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
			throwNewPermissionError();
		}

		const recipe = await recipeService.getRecipeById(recipeId);
		await ingredientService.createIngredient({ name: name.trim(), recipeId });

		await getRecipeBySlug(recipe.slug).refresh();
	}
);

export const removeIngredient = command(
	z.object({
		recipeId: z.number(),
		ingrId: z.number()
	}),
	async ({ recipeId, ingrId }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const recipe = await recipeService.getRecipeById(recipeId);
		await ingredientService.deleteIngredient(ingrId);
		await getRecipeBySlug(recipe.slug).refresh();
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
			throwNewPermissionError();
		}

		const recipe = await recipeService.getRecipeById(recipeId);
		await ingredientService.updateIngredient(ingrId, name.trim());
		await getRecipeBySlug(recipe.slug).refresh();
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
		name: z.string().trim().min(1).nonoptional(),
		description: z.string().trim().min(1).nonoptional(),
		tagType: z.array(z.string()).optional().default([]),
		tagCuisine: z.array(z.string()).optional().default([]),
		tagNutrition: z.array(z.string()).optional().default([]),
		tagDiet: z.array(z.string()).optional().default([]),
		imageUrl: z.string().optional()
	}),
	async ({ recipeId, name, description, tagType, tagCuisine, tagNutrition, tagDiet, imageUrl }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const tags = buildTagInputs({
			type: tagType,
			cuisine: tagCuisine,
			nutrition: tagNutrition,
			diet: tagDiet
		});

		const recipe = await recipeService.getRecipeById(recipeId);
		const oldSlug = recipe.slug;

		const result = await recipeService.updateRecipe(recipeId, {
			name,
			description,
			imageUrl,
			tags
		});

		await getRecipeBySlug(result.slug).refresh();
		if (result.slug !== oldSlug) {
			redirect(303, `/${result.slug}`);
		}
	}
);

export const createRecipe = form(
	z.object({
		name: z.string().trim().min(1).nonoptional(),
		description: z.string().trim().min(1).nonoptional(),
		tagType: z.array(z.string()).optional().default([]),
		tagCuisine: z.array(z.string()).optional().default([]),
		tagNutrition: z.array(z.string()).optional().default([]),
		tagDiet: z.array(z.string()).optional().default([]),
		imageUrl: z.string().optional()
	}),
	async ({ name, description, tagType, tagCuisine, tagNutrition, tagDiet, imageUrl }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const tags = buildTagInputs({
			type: tagType,
			cuisine: tagCuisine,
			nutrition: tagNutrition,
			diet: tagDiet
		});

		const recipe = await recipeService.createRecipe({
			name: name.trim(),
			description: description.trim(),
			imageUrl,
			ingredients: [],
			instructions: [],
			tags
		});

		redirect(303, `/${recipe.slug}`);
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
			throwNewPermissionError();
		}

		const recipe = await recipeService.getRecipeById(recipeId);

		await instructionService.upsertInstructionsForRecipe(
			recipeId,
			instructions.map((item, i) => ({
				...item,
				stepOrder: i + 1,
				recipeId
			}))
		);

		await getRecipeBySlug(recipe.slug).refresh();
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
			throwNewPermissionError();
		}

		const url = await imageService.uploadImage(file);
		const result = await recipeService.updateRecipe(recipeId, { imageUrl: url });

		await getRecipeBySlug(result.slug).refresh();

		return { url };
	}
);

export const deleteRecipeImage = command(z.number(), async (recipeId) => {
	if (!userCanWrite()) {
		throwNewPermissionError();
	}

	const recipe = await recipeService.getRecipeById(recipeId);

	if (!recipe.imageUrl) {
		error(400, { message: 'Recipe does not have an image to delete', code: 'VALIDATION_ERROR' });
	}

	await imageService.deleteImage(recipe.imageUrl);
	await recipeService.updateRecipe(recipeId, { imageUrl: null });

	await getRecipeBySlug(recipe.slug).refresh();

	return { success: true };
});
