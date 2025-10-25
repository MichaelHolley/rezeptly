import type { ingredients, instructions, recipes, tags } from './db/schema';

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;

export type Instruction = typeof instructions.$inferSelect;
export type NewInstruction = typeof instructions.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type RecipeWithDetails = Recipe & {
	ingredients: Ingredient[];
	instructions: Instruction[];
	tags: Tag[];
};

export type RecipeMetadata = Recipe & {
	tags: Tag[];
};
