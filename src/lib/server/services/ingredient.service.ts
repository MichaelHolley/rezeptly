import { eq } from 'drizzle-orm';
import { db } from '../db';
import { ingredients } from '../db/schema';
import type { Ingredient, NewIngredient } from '../types';

export const createIngredient = async (data: NewIngredient): Promise<Ingredient> => {
	const result = await db.insert(ingredients).values(data).returning();
	return result[0];
};

export const updateIngredient = async (id: number, name: string): Promise<Ingredient> => {
	const result = await db
		.update(ingredients)
		.set({ name })
		.where(eq(ingredients.id, id))
		.returning();
	return result[0];
};

export const deleteIngredient = async (id: number): Promise<void> => {
	await db.delete(ingredients).where(eq(ingredients.id, id));
};
