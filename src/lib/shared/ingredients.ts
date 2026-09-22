import type { Ingredient, RecipeWithDetails } from '$lib/server/types';

export type IngredientGroup = {
	heading: string | null;
	items: Ingredient[];
};

export type IngredientEditorGroup = IngredientGroup & {
	id: number | null;
};

export type IngredientNameGroup = {
	heading: string | null;
	items: string[];
};

export function groupIngredients(
	recipe: Pick<RecipeWithDetails, 'ingredients' | 'ingredientSections'>,
	includeEmptySections = true
): IngredientGroup[] {
	const groups = [
		{ heading: null, items: recipe.ingredients.filter(({ sectionId }) => sectionId === null) },
		...recipe.ingredientSections.map((section) => ({
			heading: section.name,
			items: section.ingredients
		}))
	];

	return includeEmptySections ? groups : groups.filter(({ items }) => items.length > 0);
}

export function ingredientNameGroups(
	recipe: Pick<RecipeWithDetails, 'ingredients' | 'ingredientSections'>
): IngredientNameGroup[] {
	return groupIngredients(recipe).map(({ heading, items }) => ({
		heading,
		items: items.map(({ name }) => name)
	}));
}

export function ingredientEditorGroups(
	recipe: Pick<RecipeWithDetails, 'ingredients' | 'ingredientSections'>
): IngredientEditorGroup[] {
	return [
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
}
