import type { Ingredient, IngredientSectionWithIngredients } from '$lib/server/types';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import IngredientsList from './IngredientsList.svelte';

const ingredient = (
	id: number,
	name: string,
	ingredientOrder: number,
	sectionId: number | null = null
): Ingredient => ({ id, name, ingredientOrder, recipeId: 1, sectionId });

const section = (
	id: number,
	name: string,
	sectionOrder: number,
	ingredients: Ingredient[]
): IngredientSectionWithIngredients => ({ id, name, sectionOrder, recipeId: 1, ingredients });

describe('IngredientsList.svelte', () => {
	it('renders an ungrouped recipe without a heading', () => {
		const ingredients = [ingredient(1, 'Flour', 1), ingredient(2, 'Salt', 2)];
		const { container } = render(IngredientsList, { ingredients, ingredientSections: [] });

		expect([...container.querySelectorAll('li')].map((item) => item.textContent)).toEqual([
			'Flour',
			'Salt'
		]);
		expect(container.querySelector('h4')).toBeNull();
	});

	it('renders named groups in section and ingredient order', () => {
		const sauce = [ingredient(2, 'Tomatoes', 1, 20), ingredient(3, 'Garlic', 2, 20)];
		const pasta = [ingredient(4, 'Spaghetti', 1, 21)];
		const ingredients = [...sauce, ...pasta];
		const ingredientSections = [section(20, 'Sauce', 1, sauce), section(21, 'Pasta', 2, pasta)];
		const { container } = render(IngredientsList, { ingredients, ingredientSections });

		expect([...container.querySelectorAll('h4')].map((heading) => heading.textContent)).toEqual([
			'Sauce',
			'Pasta'
		]);
		expect([...container.querySelectorAll('li')].map((item) => item.textContent)).toEqual([
			'Tomatoes',
			'Garlic',
			'Spaghetti'
		]);
	});

	it('renders ungrouped ingredients before named groups', () => {
		const ungrouped = ingredient(1, 'Salt', 1);
		const grouped = ingredient(2, 'Tomatoes', 1, 20);
		const { container } = render(IngredientsList, {
			ingredients: [ungrouped, grouped],
			ingredientSections: [section(20, 'Sauce', 1, [grouped])]
		});

		expect([...container.querySelectorAll('li')].map((item) => item.textContent)).toEqual([
			'Salt',
			'Tomatoes'
		]);
	});

	it('omits empty sections', () => {
		const { container } = render(IngredientsList, {
			ingredients: [],
			ingredientSections: [section(20, 'Future sauce', 1, [])]
		});

		expect(container.querySelector('h4')).toBeNull();
		expect(container.querySelector('li')).toBeNull();
	});
});
