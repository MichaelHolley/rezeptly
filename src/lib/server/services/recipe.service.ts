import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { ingredients, instructions, recipes, recipesToTags } from '../db/schema';
import type {
	NewIngredient,
	NewInstruction,
	NewRecipe,
	Recipe,
	RecipeMetadata,
	RecipeWithDetails,
	TagInput
} from '../types';
import { deleteImage } from './image.service';
import { upsertTags } from './tag.service';
import { generateSlug } from './util/generate-slug';

export const getRecipesMetadata = async (): Promise<RecipeMetadata[]> => {
	const result = await db.query.recipes.findMany({
		with: {
			tags: {
				with: {
					tag: true
				}
			}
		},
		orderBy: (recipes, { desc }) => [desc(recipes.createdAt)]
	});

	return result.map((r) => ({
		...r,
		tags: r.tags.map((rt) => rt.tag)
	}));
};

export const getRecipes = async (): Promise<RecipeWithDetails[]> => {
	const result = await db.query.recipes.findMany({
		with: {
			ingredients: true,
			instructions: true,
			tags: {
				with: {
					tag: true
				}
			}
		},
		orderBy: (recipes, { desc }) => [desc(recipes.createdAt)]
	});

	return result.map((r) => ({
		...r,
		tags: r.tags.map((rt) => rt.tag)
	}));
};

export const getRecipeById = async (id: number): Promise<RecipeWithDetails> => {
	const result = await db.query.recipes.findFirst({
		where: eq(recipes.id, id),
		with: {
			ingredients: true,
			instructions: true,
			tags: {
				with: {
					tag: true
				}
			}
		}
	});

	if (!result) {
		error(404, { message: `Recipe with ID ${id} not found`, code: 'NOT_FOUND' });
	}

	return {
		...result,
		tags: result.tags.map((rt) => rt.tag)
	};
};

export const getRecipeBySlug = async (slug: string): Promise<RecipeWithDetails> => {
	const result = await db.query.recipes.findFirst({
		where: eq(recipes.slug, slug),
		with: {
			ingredients: true,
			instructions: true,
			tags: {
				with: {
					tag: true
				}
			}
		}
	});

	if (!result) {
		error(404, { message: `Recipe with slug ${slug} not found`, code: 'NOT_FOUND' });
	}

	return {
		...result,
		tags: result.tags.map((rt) => rt.tag)
	};
};

export const createRecipe = async (
	data: Omit<NewRecipe, 'id' | 'slug' | 'createdAt'> & {
		ingredients: Omit<NewIngredient, 'recipeId'>[];
		instructions: Omit<NewInstruction, 'recipeId'>[];
		tags: TagInput[];
	}
): Promise<Recipe> => {
	const newRecipe = await db.transaction(async (tx) => {
		const slug = generateSlug(data.name);

		if (!slug) {
			error(400, {
				message: 'Generated slug is empty. Please provide a valid name for the recipe.',
				code: 'VALIDATION_ERROR'
			});
		}

		const [createdRecipe] = await tx
			.insert(recipes)
			.values({ name: data.name, slug, description: data.description, imageUrl: data.imageUrl })
			.returning();

		if (data.ingredients && data.ingredients.length > 0) {
			const newIngredients = data.ingredients.map((ingredient) => ({
				...ingredient,
				recipeId: createdRecipe.id
			}));

			await tx.insert(ingredients).values(newIngredients);
		}

		if (data.instructions && data.instructions.length > 0) {
			const newInstructions = data.instructions.map((instruction) => ({
				...instruction,
				recipeId: createdRecipe.id
			}));

			await tx.insert(instructions).values(newInstructions);
		}

		if (data.tags && data.tags.length > 0) {
			const resolvedTags = await upsertTags(tx, data.tags);

			if (resolvedTags.length > 0) {
				await tx.insert(recipesToTags).values(
					resolvedTags.map((tag) => ({
						recipeId: createdRecipe.id,
						tagId: tag.id
					}))
				);
			}
		}

		return createdRecipe;
	});

	return newRecipe;
};

export const updateRecipe = async (
	id: number,
	data: Partial<NewRecipe> & { tags?: TagInput[] }
): Promise<Recipe> => {
	const updatedRecipe = await db.transaction(async (tx) => {
		const [currentRecipe] = await tx.select().from(recipes).where(eq(recipes.id, id));

		if (!currentRecipe) {
			error(404, { message: `Recipe with ID ${id} not found`, code: 'NOT_FOUND' });
		}

		const slug = data.name ? generateSlug(data.name) : currentRecipe.slug;
		if (!slug) {
			error(400, {
				message: 'Generated slug is empty. Please provide a valid name for the recipe.',
				code: 'VALIDATION_ERROR'
			});
		}

		const [updatedRecipe] = await tx
			.update(recipes)
			.set({ name: data.name, slug, description: data.description, imageUrl: data.imageUrl })
			.where(eq(recipes.id, id))
			.returning();

		// Delete old image if it's being replaced
		if (currentRecipe?.imageUrl && data.imageUrl && currentRecipe.imageUrl !== data.imageUrl) {
			await deleteImage(currentRecipe.imageUrl);
		}

		// Only update tags if explicitly provided
		if (data.tags !== undefined) {
			await tx.delete(recipesToTags).where(eq(recipesToTags.recipeId, updatedRecipe.id));

			if (data.tags.length > 0) {
				const resolvedTags = await upsertTags(tx, data.tags);

				if (resolvedTags.length > 0) {
					await tx.insert(recipesToTags).values(
						resolvedTags.map((tag) => ({
							recipeId: updatedRecipe.id,
							tagId: tag.id
						}))
					);
				}
			}
		}

		return updatedRecipe;
	});

	return updatedRecipe;
};

export const deleteRecipe = async (id: number): Promise<void> => {
	// Get recipe to find image URL before deletion (getRecipeById throws if not found)
	const recipe = await getRecipeById(id);

	await db.delete(recipes).where(eq(recipes.id, id));

	// Delete associated image from Vercel Blob
	if (recipe.imageUrl) {
		await deleteImage(recipe.imageUrl);
	}
};

