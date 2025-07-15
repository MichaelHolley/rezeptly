import type { ingredients, recipes, instructions } from './db/schema';

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;

export type Instruction = typeof instructions.$inferSelect;
export type NewInstruction = typeof instructions.$inferInsert;

export type RecipeWithDetails = Recipe & {
	ingredients: Ingredient[];
	instructions: Instruction[];
};
