import { eq } from 'drizzle-orm';
import { db } from '../db';
import { ingredients, instructions, recipes, recipesToTags, tags } from '../db/schema';
import type {
	NewIngredient,
	NewInstruction,
	NewRecipe,
	NewTag,
	Recipe,
	RecipeWithDetails
} from '../types';

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

export const getRecipeById = async (id: number): Promise<RecipeWithDetails | undefined> => {
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
		return undefined;
	}

	return {
		...result,
		tags: result.tags.map((rt) => rt.tag)
	};
};

export const createRecipe = async (
	data: NewRecipe & { ingredients: NewIngredient[]; instructions: NewInstruction[]; tags: NewTag[] }
): Promise<Recipe> => {
	const newRecipe = await db.transaction(async (tx) => {
		const [createdRecipe] = await tx
			.insert(recipes)
			.values({ name: data.name, description: data.description })
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
			const newTags = await Promise.all(
				data.tags.map(async (tag) => {
					const [existingTag] = await tx.select().from(tags).where(eq(tags.name, tag.name));
					if (existingTag) {
						return existingTag;
					}
					const [newTag] = await tx.insert(tags).values({ name: tag.name }).returning();
					return newTag;
				})
			);

			await tx.insert(recipesToTags).values(
				newTags.map((tag) => ({
					recipeId: createdRecipe.id,
					tagId: tag.id
				}))
			);
		}

		return createdRecipe;
	});

	return newRecipe;
};

export const updateRecipe = async (
	id: number,
	data: Partial<NewRecipe> & { tags?: NewTag[] }
): Promise<Recipe> => {
	const updatedRecipe = await db.transaction(async (tx) => {
		const [updatedRecipe] = await tx
			.update(recipes)
			.set({ name: data.name, description: data.description })
			.where(eq(recipes.id, id))
			.returning();

		await tx.delete(recipesToTags).where(eq(recipesToTags.recipeId, updatedRecipe.id));

		if (data.tags && data.tags.length > 0) {
			const newTags = await Promise.all(
				data.tags.map(async (tag) => {
					const [existingTag] = await tx.select().from(tags).where(eq(tags.name, tag.name));
					if (existingTag) {
						return existingTag;
					}
					const [newTag] = await tx.insert(tags).values({ name: tag.name }).returning();
					return newTag;
				})
			);

			await tx.insert(recipesToTags).values(
				newTags.map((tag) => ({
					recipeId: updatedRecipe.id,
					tagId: tag.id
				}))
			);
		}

		return updatedRecipe;
	});

	return updatedRecipe;
};

export const deleteRecipe = async (id: number): Promise<void> => {
	await db.delete(recipes).where(eq(recipes.id, id));
};
