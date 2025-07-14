import { db } from '../db';
import { recipes, ingredients, instructions } from '../db/schema';
import { eq } from 'drizzle-orm';
import type {
	NewRecipe,
	Recipe,
	RecipeWithDetails,
	NewIngredient,
	NewInstruction
} from '../types';

export const getRecipes = async (): Promise<RecipeWithDetails[]> => {
	const result = await db.query.recipes.findMany({
		with: {
			ingredients: true,
			instructions: true
		},
		orderBy: (recipes, { desc }) => [desc(recipes.createdAt)]
	});
	return result;
};

export const getRecipeById = async (id: number): Promise<RecipeWithDetails | undefined> => {
	const result = await db.query.recipes.findFirst({
		where: eq(recipes.id, id),
		with: {
			ingredients: true,
			instructions: true
		}
	});
	return result;
};

export const createRecipe = async (
	data: NewRecipe & { ingredients: NewIngredient[]; instructions: NewInstruction[] }
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
