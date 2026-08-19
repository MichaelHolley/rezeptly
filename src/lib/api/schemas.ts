import { z } from 'zod';

const idSchema = z
	.pipe(
		z.string(),
		z.transform((id) => Number(id))
	)
	.or(z.number())
	.pipe(z.int32().positive());

export const recipeIdSchema = idSchema;

export const ingredientIdSchema = idSchema;

export const tagIdSchema = idSchema;

export const recipeDetailsSchema = z.object({
	name: z.string().trim().min(1).nonoptional(),
	description: z.string().trim().min(1).nonoptional(),
	tagType: z.array(z.string()).optional().default([]),
	tagCuisine: z.array(z.string()).optional().default([]),
	tagNutrition: z.array(z.string()).optional().default([]),
	tagDiet: z.array(z.string()).optional().default([]),
	imageUrl: z.string().optional(),
	durationMinutes: z.int().nonnegative().optional()
});
