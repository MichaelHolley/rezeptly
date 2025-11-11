import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { ingredients, instructions, recipes, recipesToTags, tags } from '../db/schema';
import type {
	NewIngredient,
	NewInstruction,
	NewRecipe,
	NewTag,
	Recipe,
	RecipeMetadata,
	RecipeWithDetails
} from '../types';

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
	data: NewRecipe & {
		ingredients: Omit<NewIngredient, 'recipeId'>[];
		instructions: Omit<NewInstruction, 'recipeId'>[];
		tags: NewTag[];
	}
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
			// 1. Deduplicate input (case-sensitive - preserves original case)
			const uniqueTagNames = [...new Set(data.tags.map((t) => t.name.trim()))];

			// 2. Batch fetch existing tags (single query)
			const existingTags = await tx.select().from(tags).where(inArray(tags.name, uniqueTagNames));

			// 3. Create map for quick lookup (case-sensitive)
			const existingTagMap = new Map(existingTags.map((t) => [t.name, t]));

			// 4. Sequentially insert only missing tags with error handling
			const allTags = [];
			for (const tagName of uniqueTagNames) {
				if (existingTagMap.has(tagName)) {
					allTags.push(existingTagMap.get(tagName)!);
				} else {
					try {
						const [newTag] = await tx.insert(tags).values({ name: tagName }).returning();
						allTags.push(newTag);
						existingTagMap.set(tagName, newTag);
					} catch {
						// Handle unique constraint violation - fetch the tag that was just created
						const [existingTag] = await tx.select().from(tags).where(eq(tags.name, tagName));
						if (existingTag) {
							allTags.push(existingTag);
							existingTagMap.set(tagName, existingTag);
						}
					}
				}
			}

			// 5. Insert into junction table
			await tx.insert(recipesToTags).values(
				allTags.map((tag) => ({
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
			// 1. Deduplicate input (case-sensitive - preserves original case)
			const uniqueTagNames = [...new Set(data.tags.map((t) => t.name.trim()))];

			// 2. Batch fetch existing tags (single query)
			const existingTags = await tx.select().from(tags).where(inArray(tags.name, uniqueTagNames));

			// 3. Create map for quick lookup (case-sensitive)
			const existingTagMap = new Map(existingTags.map((t) => [t.name, t]));

			// 4. Sequentially insert only missing tags with error handling
			const allTags = [];
			for (const tagName of uniqueTagNames) {
				if (existingTagMap.has(tagName)) {
					allTags.push(existingTagMap.get(tagName)!);
				} else {
					try {
						const [newTag] = await tx.insert(tags).values({ name: tagName }).returning();
						allTags.push(newTag);
						existingTagMap.set(tagName, newTag);
					} catch {
						// Handle unique constraint violation - fetch the tag that was just created
						const [existingTag] = await tx.select().from(tags).where(eq(tags.name, tagName));
						if (existingTag) {
							allTags.push(existingTag);
							existingTagMap.set(tagName, existingTag);
						}
					}
				}
			}

			// 5. Insert into junction table
			await tx.insert(recipesToTags).values(
				allTags.map((tag) => ({
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
