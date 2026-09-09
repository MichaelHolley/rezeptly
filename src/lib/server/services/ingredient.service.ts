import { eq } from 'drizzle-orm';
import { db } from '../db';
import { ingredients } from '../db/schema';
import type { Ingredient, IngredientId, NewIngredient, RecipeId } from '../types';

export const createIngredient = async (data: NewIngredient): Promise<Ingredient> => {
	const result = await db.insert(ingredients).values(data).returning();
	return result[0];
};

export const updateIngredient = async (id: IngredientId, name: string): Promise<Ingredient> => {
	const result = await db
		.update(ingredients)
		.set({ name })
		.where(eq(ingredients.id, id))
		.returning();
	return result[0];
};

export const deleteIngredient = async (id: IngredientId): Promise<void> => {
	await db.delete(ingredients).where(eq(ingredients.id, id));
};

export const replaceIngredientsForRecipe = async (
	recipeId: RecipeId,
	names: string[]
): Promise<void> => {
	await db.transaction(async (tx) => {
		await tx.delete(ingredients).where(eq(ingredients.recipeId, recipeId));

		if (names.length > 0) {
			await tx.insert(ingredients).values(names.map((name) => ({ name, recipeId })));
		}
	});
};
