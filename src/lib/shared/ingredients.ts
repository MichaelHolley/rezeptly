import type { Ingredient, RecipeWithDetails } from '$lib/server/types';

export type IngredientGroup = {
	id: number | null;
	heading: string | null;
	items: Ingredient[];
};

export type IngredientNameGroup = {
	heading: string | null;
	items: string[];
};

type GroupableRecipe = Pick<RecipeWithDetails, 'ingredients' | 'ingredientSections'>;

export function groupIngredients(
	recipe: GroupableRecipe,
	includeEmptySections = true
): IngredientGroup[] {
	const groups = [
		{
			id: null,
			heading: null,
			items: recipe.ingredients.filter(({ sectionId }) => sectionId === null)
		},
		...recipe.ingredientSections.map((section) => ({
			id: section.id,
			heading: section.name,
			items: section.ingredients
		}))
	];

	return includeEmptySections ? groups : groups.filter(({ items }) => items.length > 0);
}

export function ingredientNameGroups(
	recipe: GroupableRecipe,
	includeEmptySections = true
): IngredientNameGroup[] {
	return groupIngredients(recipe, includeEmptySections).map(({ heading, items }) => ({
		heading,
		items: items.map(({ name }) => name)
	}));
}
