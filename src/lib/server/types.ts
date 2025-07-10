import type { ingredients, recipes } from './db/schema';

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;

export type RecipeWithIngredients = Recipe & {
	ingredients: Ingredient[];
};
