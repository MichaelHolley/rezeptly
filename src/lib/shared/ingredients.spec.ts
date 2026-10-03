import type { Ingredient, IngredientSectionWithIngredients } from '$lib/server/types';
import { describe, expect, it } from 'vitest';
import { ingredientNameGroups } from './ingredients';

const ingredient = (id: number, name: string, sectionId: number | null = null): Ingredient => ({
	id,
	name,
	ingredientOrder: id,
	recipeId: 1,
	sectionId
});

const section = (
	id: number,
	name: string,
	ingredients: Ingredient[]
): IngredientSectionWithIngredients => ({ id, name, sectionOrder: id, recipeId: 1, ingredients });

const salt = ingredient(1, 'Salt');
const tomato = ingredient(2, 'Tomato', 20);
const spaghetti = ingredient(3, 'Spaghetti', 21);

describe('ingredientNameGroups without empty sections', () => {
	it.each([
		['an empty recipe', [], [], []],
		['ungrouped ingredients only', [salt], [], [{ heading: null, items: ['Salt'] }]],
		[
			'ungrouped first, sections in order, empty sections omitted',
			[salt, tomato, spaghetti],
			[section(20, 'Sauce', [tomato]), section(21, 'Pasta', [spaghetti]), section(22, 'Empty', [])],
			[
				{ heading: null, items: ['Salt'] },
				{ heading: 'Sauce', items: ['Tomato'] },
				{ heading: 'Pasta', items: ['Spaghetti'] }
			]
		],
		[
			'no ungrouped group when every ingredient is in a section',
			[tomato],
			[section(20, 'Sauce', [tomato])],
			[{ heading: 'Sauce', items: ['Tomato'] }]
		]
	])('groups %s', (_, ingredients, ingredientSections, expected) => {
		expect(ingredientNameGroups({ ingredients, ingredientSections }, false)).toEqual(expected);
	});
});
