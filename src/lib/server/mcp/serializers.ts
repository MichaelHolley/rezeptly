import type { z } from 'zod';
import type { RecipeMetadata, RecipeWithDetails, Tag } from '../types';
import type { recipeDetailSchema, recipeSummarySchema } from './schemas';

/** Internal row ids are omitted; `slug` is the public handle for a recipe. */
export const serializeSummary = (recipe: RecipeMetadata): z.infer<typeof recipeSummarySchema> => ({
	slug: recipe.slug,
	name: recipe.name,
	description: recipe.description,
	imageUrl: recipe.imageUrl,
	durationMinutes: recipe.durationMinutes,
	portions: recipe.portions,
	createdAt: recipe.createdAt?.toISOString() ?? null,
	tags: recipe.tags.map((t: Tag) => ({ name: t.name, slug: t.slug, category: t.category }))
});

export const serializeDetail = (recipe: RecipeWithDetails): z.infer<typeof recipeDetailSchema> => ({
	...serializeSummary(recipe),
	ingredients: recipe.ingredients.map((i) => i.name),
	instructions: recipe.instructions.map((i) => ({
		heading: i.heading,
		instructions: i.instructions,
		stepOrder: i.stepOrder
	}))
});
