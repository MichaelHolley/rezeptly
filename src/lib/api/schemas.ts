import { z } from 'zod';

/** Matches the `integer` primary keys in the database schema. */
export const idSchema = z.int32().positive();

/** Ids arriving through `FormData` are strings; JSON payloads send them as numbers. */
export const formIdSchema = z
	.pipe(
		z.string(),
		z.transform((id) => Number(id))
	)
	.or(z.number())
	.pipe(idSchema);

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
