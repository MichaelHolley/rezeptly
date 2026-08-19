import { z } from 'zod';

export const recipeIdSchema = z
	.pipe(
		z.string(),
		z.transform((id) => Number(id))
	)
	.or(z.number())
	.pipe(z.int32().positive());

export const ingredientIdSchema = z
	.pipe(
		z.string(),
		z.transform((id) => Number(id))
	)
	.or(z.number())
	.pipe(z.int32().positive());

export const tagIdSchema = z
	.pipe(
		z.string(),
		z.transform((id) => Number(id))
	)
	.or(z.number())
	.pipe(z.int32().positive());

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
