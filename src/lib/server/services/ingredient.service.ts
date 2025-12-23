import { eq } from 'drizzle-orm';
import { db } from '../db';
import { ingredients } from '../db/schema';
import { NotFoundError } from '../errors';
import type { Ingredient, NewIngredient } from '../types';

export const getIngredientById = async (id: number): Promise<Ingredient | undefined> => {
	return await db.query.ingredients.findFirst({
		where: eq(ingredients.id, id)
	});
};

export const createIngredient = async (data: NewIngredient): Promise<Ingredient> => {
	const result = await db.insert(ingredients).values(data).returning();
	return result[0];
};

export const deleteIngredient = async (id: number): Promise<void> => {
	const existing = await getIngredientById(id);
	if (!existing) {
		throw new NotFoundError('Ingredient', id);
	}

	await db.delete(ingredients).where(eq(ingredients.id, id));
};
