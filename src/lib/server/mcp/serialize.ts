import type { RecipeMetadata, RecipeWithDetails, Tag } from '../types';

export type SerializedTag = {
	name: string;
	slug: string;
	category: Tag['category'];
};

export type SerializedRecipeSummary = {
	slug: string;
	name: string;
	description: string | null;
	imageUrl: string | null;
	durationMinutes: number | null;
	portions: number | null;
	createdAt: string | null;
	tags: SerializedTag[];
};

export type SerializedRecipeDetail = SerializedRecipeSummary & {
	ingredients: string[];
	instructions: { heading: string | null; instructions: string; stepOrder: number }[];
};

export const serializeTag = (tag: Tag): SerializedTag => ({
	name: tag.name,
	slug: tag.slug,
	category: tag.category
});

/** Internal row ids are omitted; `slug` is the public handle for a recipe. */
export const serializeRecipeSummary = (recipe: RecipeMetadata): SerializedRecipeSummary => ({
	slug: recipe.slug,
	name: recipe.name,
	description: recipe.description,
	imageUrl: recipe.imageUrl,
	durationMinutes: recipe.durationMinutes,
	portions: recipe.portions,
	createdAt: recipe.createdAt?.toISOString() ?? null,
	tags: recipe.tags.map(serializeTag)
});

export const serializeRecipeDetail = (recipe: RecipeWithDetails): SerializedRecipeDetail => ({
	...serializeRecipeSummary(recipe),
	ingredients: recipe.ingredients.map((i) => i.name),
	instructions: [...recipe.instructions]
		.sort((a, b) => a.stepOrder - b.stepOrder)
		.map((i) => ({ heading: i.heading, instructions: i.instructions, stepOrder: i.stepOrder }))
});
