import { db } from '../db';
import { ingredients } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
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

export const updateIngredientsForRecipe = async (
	recipeId: number,
	newIngredientNames: string[]
): Promise<void> => {
	await db.transaction(async (tx) => {
		const existingIngredients = await tx.query.ingredients.findMany({
			columns: {
				id: true,
				name: true
			},
			where: eq(ingredients.recipeId, recipeId)
		});

		const existingIngredientNames = existingIngredients.map((i) => i.name);

		const ingredientsToDelete = existingIngredients.filter(
			(ingredient) => !newIngredientNames.includes(ingredient.name)
		);

		if (ingredientsToDelete.length > 0) {
			await tx
				.delete(ingredients)
				.where(
					inArray(
						ingredients.id,
						ingredientsToDelete.map((i) => i.id)
					)
				);
		}

		const ingredientsToAdd = newIngredientNames
			.filter((name) => !existingIngredientNames.includes(name))
			.map((name) => ({
				name,
				recipeId
			}));

		if (ingredientsToAdd.length > 0) {
			await tx.insert(ingredients).values(ingredientsToAdd);
		}
	});
};
