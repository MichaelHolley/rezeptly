import { TAG_CATEGORIES } from '$lib/shared/tags';
import { z } from 'zod';
import type { TagCategory } from '../types';

export const tagSchema = z.object({
	name: z.string(),
	slug: z.string(),
	category: z.enum(TAG_CATEGORIES as [TagCategory, ...TagCategory[]])
});

export const recipeSummarySchema = z.object({
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	imageUrl: z.string().nullable(),
	durationMinutes: z.number().nullable(),
	portions: z.number().nullable(),
	createdAt: z.string().nullable(),
	tags: z.array(tagSchema)
});

export const recipeDetailSchema = recipeSummarySchema.extend({
	ingredients: z.array(z.string()),
	instructions: z.array(
		z.object({
			heading: z.string().nullable(),
			instructions: z.string(),
			stepOrder: z.number()
		})
	)
});
