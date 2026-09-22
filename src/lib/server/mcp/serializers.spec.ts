import type { Ingredient, IngredientSectionWithIngredients, RecipeWithDetails } from '../types';
import { describe, expect, it } from 'vitest';
import { serializeDetail } from './serializers';

const ingredient = (
	id: number,
	name: string,
	ingredientOrder: number,
	sectionId: number | null
): Ingredient => ({ id, name, ingredientOrder, recipeId: 1, sectionId });

const section = (
	id: number,
	name: string,
	sectionOrder: number,
	ingredients: Ingredient[]
): IngredientSectionWithIngredients => ({ id, name, sectionOrder, recipeId: 1, ingredients });

function recipe(
	ingredients: Ingredient[],
	ingredientSections: IngredientSectionWithIngredients[]
): RecipeWithDetails {
	return {
		id: 1,
		name: 'Pasta',
		slug: 'pasta',
		description: null,
		imageUrl: null,
		course: null,
		durationMinutes: null,
		portions: null,
		createdAt: null,
		publishedAt: new Date(),
		ingredients,
		ingredientSections,
		instructions: [],
		tags: []
	};
}

describe('serializeDetail', () => {
	it('returns an empty ingredient group list for an empty recipe', () => {
		expect(serializeDetail(recipe([], []), 'https://example.com').ingredients).toEqual([]);
	});

	it('returns one null-heading group for ungrouped ingredients', () => {
		const salt = ingredient(1, 'Salt', 1, null);
		expect(serializeDetail(recipe([salt], []), 'https://example.com').ingredients).toEqual([
			{ heading: null, items: ['Salt'] }
		]);
	});

	it('returns ungrouped ingredients first and omits empty sections', () => {
		const salt = ingredient(1, 'Salt', 1, null);
		const tomato = ingredient(2, 'Tomato', 1, 20);
		const detail = serializeDetail(
			recipe([salt, tomato], [section(20, 'Sauce', 1, [tomato]), section(21, 'Empty', 2, [])]),
			'https://example.com'
		);

		expect(detail.ingredients).toEqual([
			{ heading: null, items: ['Salt'] },
			{ heading: 'Sauce', items: ['Tomato'] }
		]);
	});
});
