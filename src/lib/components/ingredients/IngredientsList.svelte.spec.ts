import type { Ingredient } from '$lib/server/types';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import IngredientsList from './IngredientsList.svelte';

describe('IngredientsList.svelte', () => {
	const mockIngredients: Ingredient[] = [
		{ id: 1, name: '2 cups flour', recipeId: 1 },
		{ id: 2, name: '1 cup sugar', recipeId: 1 },
		{ id: 3, name: '3 eggs', recipeId: 1 }
	];

	describe('rendering', () => {
		it('should render empty list when no ingredients provided', async () => {
			const { container } = render(IngredientsList, { ingredients: [] });

			const list = container.querySelector('ul');
			expect(list).toBeTruthy();

			const items = container.querySelectorAll('li');
			expect(items.length).toBe(0);
		});

		it('should render all ingredients', async () => {
			const { container } = render(IngredientsList, { ingredients: mockIngredients });

			const items = container.querySelectorAll('li');
			expect(items.length).toBe(3);
		});

		it('should render single ingredient correctly', async () => {
			const singleIngredient: Ingredient[] = [{ id: 1, name: '1 teaspoon salt', recipeId: 1 }];

			const { container } = render(IngredientsList, { ingredients: singleIngredient });

			const items = container.querySelectorAll('li');
			expect(items.length).toBe(1);

			const saltElement = await page.getByText('1 teaspoon salt');
			await expect.element(saltElement).toBeInTheDocument();
		});
	});

	describe('ingredient display', () => {
		it('should display ingredient names correctly', async () => {
			render(IngredientsList, { ingredients: mockIngredients });

			const flourElement = await page.getByText('2 cups flour');
			await expect.element(flourElement).toBeInTheDocument();

			const sugarElement = await page.getByText('1 cup sugar');
			await expect.element(sugarElement).toBeInTheDocument();

			const eggsElement = await page.getByText('3 eggs');
			await expect.element(eggsElement).toBeInTheDocument();
		});

		it('should render ingredients in order', async () => {
			const { container } = render(IngredientsList, { ingredients: mockIngredients });

			const items = container.querySelectorAll('li span');
			expect(items[0].textContent).toBe('2 cups flour');
			expect(items[1].textContent).toBe('1 cup sugar');
			expect(items[2].textContent).toBe('3 eggs');
		});

		it('should handle ingredients with special characters', async () => {
			const specialIngredients: Ingredient[] = [
				{ id: 1, name: '½ cup milk & cream', recipeId: 1 },
				{ id: 2, name: "2 tbsp chef's seasoning", recipeId: 1 }
			];

			render(IngredientsList, { ingredients: specialIngredients });

			const milkElement = await page.getByText('½ cup milk & cream');
			await expect.element(milkElement).toBeInTheDocument();

			const seasoningElement = await page.getByText("2 tbsp chef's seasoning");
			await expect.element(seasoningElement).toBeInTheDocument();
		});
	});

	describe('styling', () => {
		it('should apply custom className when provided', async () => {
			const { container } = render(IngredientsList, {
				ingredients: mockIngredients,
				class: 'custom-class'
			});

			const wrapper = container.querySelector('.custom-class');
			expect(wrapper).toBeTruthy();
		});

		it('should not apply className when not provided', async () => {
			const { container } = render(IngredientsList, { ingredients: mockIngredients });

			const wrapper = container.querySelector('div');
			expect(wrapper?.className).toBe('');
		});
	});
});
