import { db } from '../db';
import { recipes, ingredients } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { NewRecipe, Recipe, RecipeWithIngredients, NewIngredient } from '../types';

export const getRecipes = async (): Promise<RecipeWithIngredients[]> => {
	const result = await db.query.recipes.findMany({
		with: {
			ingredients: true
		},
		orderBy: (recipes, { desc }) => [desc(recipes.createdAt)]
	});
	return result;
};

export const getRecipeById = async (id: number): Promise<RecipeWithIngredients | undefined> => {
	const result = await db.query.recipes.findFirst({
		where: eq(recipes.id, id),
		with: {
			ingredients: true
		}
	});
	return result;
};

export const createRecipe = async (
	data: NewRecipe & { ingredients: NewIngredient[] }
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

		return createdRecipe;
	});

	return newRecipe;
};

export const updateRecipe = async (id: number, data: Partial<NewRecipe>): Promise<Recipe> => {
	const result = await db.update(recipes).set(data).where(eq(recipes.id, id)).returning();
	return result[0];
};

export const deleteRecipe = async (id: number): Promise<void> => {
	await db.delete(recipes).where(eq(recipes.id, id));
};

export const createRecipeWithoutIngredients = async (data: NewRecipe): Promise<Recipe> => {
	const [newRecipe] = await db.insert(recipes).values(data).returning();
	return newRecipe;
};
