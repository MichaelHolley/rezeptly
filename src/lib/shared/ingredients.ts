import type { Ingredient, IngredientSectionWithIngredients } from '#lib/server/types.js';

export type IngredientGroup = {
	id: number | null;
	heading: string | null;
	items: Ingredient[];
};

export type IngredientNameGroup = {
	heading: string | null;
	items: string[];
};

export type IngredientRows = {
	ingredients: Ingredient[];
	ingredientSections: IngredientSectionWithIngredients[];
};

/** Always starts with the ungrouped block, even when it is empty, followed by every section in order. */
export function groupIngredients({
	ingredients,
	ingredientSections
}: IngredientRows): IngredientGroup[] {
	return [
		{
			id: null,
			heading: null,
			items: ingredients.filter(({ sectionId }) => sectionId === null)
		},
		...ingredientSections.map((section) => ({
			id: section.id,
			heading: section.name,
			items: section.ingredients
		}))
	];
}

export function nonEmptyGroups<T extends { items: unknown[] }>(groups: T[]): T[] {
	return groups.filter(({ items }) => items.length > 0);
}

export function ingredientNames(groups: IngredientGroup[]): string[] {
	return groups.flatMap(({ items }) => items.map(({ name }) => name));
}

export function ingredientNameGroups(groups: IngredientGroup[]): IngredientNameGroup[] {
	return groups.map(({ heading, items }) => ({
		heading,
		items: items.map(({ name }) => name)
	}));
}

export function withUngroupedFirst(groups: IngredientNameGroup[]): IngredientNameGroup[] {
	return groups[0]?.heading === null ? groups : [{ heading: null, items: [] }, ...groups];
}
