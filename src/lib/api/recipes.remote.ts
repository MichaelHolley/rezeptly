import { command, form, query } from '$app/server';
import { guardedQuery, userCanWrite } from '$lib/server/auth/permissions';
import * as aiService from '$lib/server/services/ai.service';
import * as imageService from '$lib/server/services/image.service';
import * as ingredientService from '$lib/server/services/ingredient.service';
import * as instructionService from '$lib/server/services/instruction.service';
import * as recipeService from '$lib/server/services/recipe.service';
import * as tagService from '$lib/server/services/tag.service';
import { buildRecipeInput } from '$lib/server/services/util/build-recipe-input';
import type { TagCategory, TagInput } from '$lib/server/types';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { throwNewPermissionError } from '../server/error';
import { ingredientIdSchema, recipeDetailsSchema, recipeIdSchema } from './schemas';

const ingredientNameSchema = z.string().trim().min(1, 'Name is required');

function buildTagInputs(input: Partial<Record<TagCategory, string[]>>): TagInput[] {
	return (Object.entries(input) as [TagCategory, string[]][]).flatMap(([category, names]) =>
		(names ?? []).map((name) => ({ name, category }))
	);
}

export const getRecipesMetadata = query(async () => {
	return await recipeService.getRecipesMetadata();
});

export const getDraftRecipesMetadata = guardedQuery(async () => {
	return await recipeService.getRecipesMetadata(undefined, undefined, { onlyDrafts: true });
});

export const getAvailableTags = query(async () => {
	return await tagService.getAllTags();
});

export const getRecipeBySlug = query(z.string(), async (slug) => {
	const recipe = await recipeService.getRecipeBySlug(slug, { includeDrafts: userCanWrite() });
	return recipe;
});

export const deleteRecipe = form(
	z.object({
		recipeId: recipeIdSchema
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
		recipeId: recipeIdSchema,
		name: ingredientNameSchema
	}),
	async ({ recipeId, name }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const recipe = await recipeService.getRecipeById(recipeId, { includeDrafts: true });
		await ingredientService.createIngredient({ name, recipeId });

		await getRecipeBySlug(recipe.slug).refresh();
	}
);

export const removeIngredient = command(
	z.object({
		recipeId: recipeIdSchema,
		ingrId: ingredientIdSchema
	}),
	async ({ recipeId, ingrId }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const recipe = await recipeService.getRecipeById(recipeId, { includeDrafts: true });
		await ingredientService.deleteIngredient(ingrId);
		await getRecipeBySlug(recipe.slug).refresh();
	}
);

export const editIngredient = form(
	z.object({
		recipeId: recipeIdSchema,
		ingrId: ingredientIdSchema,
		name: ingredientNameSchema
	}),
	async ({ recipeId, ingrId, name }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const recipe = await recipeService.getRecipeById(recipeId, { includeDrafts: true });
		await ingredientService.updateIngredient(ingrId, name);
		await getRecipeBySlug(recipe.slug).refresh();
	}
);

export const updateRecipeDetails = form(
	recipeDetailsSchema.extend({ recipeId: recipeIdSchema }),
	async ({
		recipeId,
		name,
		description,
		tagType,
		tagCuisine,
		tagNutrition,
		tagDiet,
		imageUrl,
		course,
		durationMinutes
	}) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const tags = buildTagInputs({
			type: tagType,
			cuisine: tagCuisine,
			nutrition: tagNutrition,
			diet: tagDiet
		});

		const recipe = await recipeService.getRecipeById(recipeId, { includeDrafts: true });
		const oldSlug = recipe.slug;

		const result = await recipeService.updateRecipe(recipeId, {
			name,
			description,
			imageUrl,
			course: course ?? null,
			durationMinutes: durationMinutes ?? null,
			tags
		});

		await getRecipeBySlug(result.slug).refresh();
		if (result.slug !== oldSlug) {
			redirect(303, `/${result.slug}`);
		}
	}
);

export const createRecipe = form(
	recipeDetailsSchema.extend({ importImage: z.instanceof(File).optional() }),
	async ({
		name,
		description,
		tagType,
		tagCuisine,
		tagNutrition,
		tagDiet,
		imageUrl,
		importImage,
		course,
		durationMinutes
	}) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const tags = buildTagInputs({
			type: tagType,
			cuisine: tagCuisine,
			nutrition: tagNutrition,
			diet: tagDiet
		});

		const extracted =
			importImage && importImage.size > 0
				? await aiService.extractRecipeFromImage(importImage)
				: { ingredients: [], instructions: [] };

		const recipe = await recipeService.createRecipe({
			name: name.trim(),
			description: description.trim(),
			imageUrl,
			course: course ?? null,
			durationMinutes: durationMinutes ?? null,
			ingredients: extracted.ingredients,
			instructions: extracted.instructions.map((item, i) => ({ ...item, stepOrder: i + 1 })),
			tags
		});

		redirect(303, `/${recipe.slug}`);
	}
);

export const importRecipeFromImage = command(z.instanceof(File), async (image) => {
	if (!userCanWrite()) {
		throwNewPermissionError();
	}

	imageService.validateImageFile(image);

	const existingTags = await tagService.getAllTags();
	const extracted = await aiService.extractRecipeFromImage(image, existingTags);

	if (!extracted.isRecipe) {
		error(422, {
			message: 'This image does not look like a recipe. Nothing was imported.',
			code: 'VALIDATION_ERROR'
		});
	}

	const input = buildRecipeInput(extracted, existingTags);

	if (!input.name) {
		error(422, {
			message: 'Could not determine a recipe name from this image. Nothing was imported.',
			code: 'VALIDATION_ERROR'
		});
	}

	const recipe = await recipeService.createRecipe({ ...input, imageUrl: null });

	await getDraftRecipesMetadata().refresh();

	return { slug: recipe.slug };
});

export const updateInstructions = form(
	z.object({
		recipeId: recipeIdSchema,
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

		const recipe = await recipeService.getRecipeById(recipeId, { includeDrafts: true });

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
		recipeId: recipeIdSchema,
		file: z.instanceof(File).refine((f) => f.size <= imageService.getMaxUploadBytes(), {
			message: 'File is too large.'
		})
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

export const updateRecipePortions = command(
	z.object({
		recipeId: recipeIdSchema,
		portions: z.int().min(1).max(99).nullable()
	}),
	async ({ recipeId, portions }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const recipe = await recipeService.getRecipeById(recipeId, { includeDrafts: true });
		await recipeService.updateRecipe(recipeId, { portions });
		await getRecipeBySlug(recipe.slug).refresh();
	}
);

export const setRecipePublished = command(
	z.object({
		recipeId: recipeIdSchema,
		published: z.boolean()
	}),
	async ({ recipeId, published }) => {
		if (!userCanWrite()) {
			throwNewPermissionError();
		}

		const recipe = await recipeService.setRecipePublished(recipeId, published);

		await getRecipeBySlug(recipe.slug).refresh();
		await getRecipesMetadata().refresh();
		await getDraftRecipesMetadata().refresh();
	}
);

export const deleteRecipeImage = command(recipeIdSchema, async (recipeId) => {
	if (!userCanWrite()) {
		throwNewPermissionError();
	}

	const recipe = await recipeService.getRecipeById(recipeId, { includeDrafts: true });

	if (!recipe.imageUrl) {
		error(400, { message: 'Recipe does not have an image to delete', code: 'VALIDATION_ERROR' });
	}

	await imageService.deleteImage(recipe.imageUrl);
	await recipeService.updateRecipe(recipeId, { imageUrl: null });

	await getRecipeBySlug(recipe.slug).refresh();

	return { success: true };
});
