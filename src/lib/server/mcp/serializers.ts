import type { z } from 'zod';
import type { RecipeMetadata, RecipeWithDetails, Tag } from '../types';
import type { recipeDetailSchema, recipeSummarySchema } from './schemas';
import { groupIngredients } from '$lib/shared/ingredients';

/** Internal row ids are omitted; `slug` is the public handle for a recipe. */
export const serializeSummary = (recipe: RecipeMetadata): z.infer<typeof recipeSummarySchema> => ({
	slug: recipe.slug,
	name: recipe.name,
	description: recipe.description,
	imageUrl: recipe.imageUrl,
	course: recipe.course,
	durationMinutes: recipe.durationMinutes,
	portions: recipe.portions,
	createdAt: recipe.createdAt?.toISOString() ?? null,
	tags: recipe.tags.map((t: Tag) => ({ name: t.name, slug: t.slug, category: t.category }))
});

export const serializeDetail = (
	recipe: RecipeWithDetails,
	baseUrl: string
): z.infer<typeof recipeDetailSchema> => ({
	...serializeSummary(recipe),
	url: `${baseUrl}/${recipe.slug}`,
	ingredients: groupIngredients(recipe, false).map(({ heading, items }) => ({
		heading,
		items: items.map(({ name }) => name)
	})),
	instructions: recipe.instructions.map((i) => ({
		heading: i.heading,
		instructions: i.instructions,
		stepOrder: i.stepOrder
	}))
});
