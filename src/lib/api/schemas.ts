import { z } from 'zod';

const idSchema = z
	.pipe(
		z.string(),
		z.transform((id) => Number(id))
	)
	.or(z.number())
	.pipe(z.int32().positive());

export const recipeIdSchema = idSchema.brand<'RecipeId'>();
export const ingredientIdSchema = idSchema.brand<'IngredientId'>();
export const tagIdSchema = idSchema.brand<'TagId'>();

export type RecipeId = z.output<typeof recipeIdSchema>;
export type IngredientId = z.output<typeof ingredientIdSchema>;
export type TagId = z.output<typeof tagIdSchema>;

export const recipeDetailsSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').nonoptional(),
	description: z.string().trim().min(1, 'Description is required').nonoptional(),
	tagType: z.array(z.string()).optional().default([]),
	tagCuisine: z.array(z.string()).optional().default([]),
	tagNutrition: z.array(z.string()).optional().default([]),
	tagDiet: z.array(z.string()).optional().default([]),
	imageUrl: z.string().optional(),
	durationMinutes: z.int().nonnegative().optional()
});
