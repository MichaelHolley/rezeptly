import { db } from '../db';
import { ingredients } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Ingredient, NewIngredient } from '../types';

export const getIngredients = async (recipeId: number): Promise<Ingredient[]> => {
	return await db.query.ingredients.findMany({
        where: eq(ingredients.recipeId, recipeId)
    });
};

export const createIngredient = async (data: NewIngredient): Promise<Ingredient> => {
	const result = await db.insert(ingredients).values(data).returning();
	return result[0];
};

export const updateIngredient = async (id: number, data: Partial<NewIngredient>): Promise<Ingredient> => {
	const result = await db.update(ingredients).set(data).where(eq(ingredients.id, id)).returning();
	return result[0];
};

export const deleteIngredient = async (id: number): Promise<void> => {
	await db.delete(ingredients).where(eq(ingredients.id, id));
};
