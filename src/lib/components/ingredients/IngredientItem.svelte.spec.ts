import type { Ingredient } from '$lib/server/types';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import IngredientItem from './IngredientItem.svelte';

describe('IngredientItem.svelte', () => {
	const mockIngredient: Ingredient = {
		id: 1,
		name: '2 cups flour',
		recipeId: 1
	};

	describe('rendering', () => {
		it('should render ingredient name', async () => {
			render(IngredientItem, { ingredient: mockIngredient, recipeId: 1 });

			const ingredientName = await page.getByText('2 cups flour');
			await expect.element(ingredientName).toBeInTheDocument();
		});

		it('should render delete button', async () => {
			const { container } = render(IngredientItem, { ingredient: mockIngredient, recipeId: 1 });

			const button = container.querySelector('button');
			expect(button).toBeTruthy();
			expect(button?.type).toBe('button');
		});

		it('should render trash icon in button', async () => {
			const { container } = render(IngredientItem, { ingredient: mockIngredient, recipeId: 1 });

			const svg = container.querySelector('button svg');
			expect(svg).toBeTruthy();
		});

		it('should render ingredient with special characters', async () => {
			const specialIngredient: Ingredient = {
				id: 2,
				name: '½ cup milk & cream',
				recipeId: 1
			};

			render(IngredientItem, { ingredient: specialIngredient, recipeId: 1 });

			const ingredientName = await page.getByText('½ cup milk & cream');
			await expect.element(ingredientName).toBeInTheDocument();
		});

		it('should render ingredient with long name', async () => {
			const longNameIngredient: Ingredient = {
				id: 3,
				name: '2 cups of all-purpose flour, sifted and measured correctly',
				recipeId: 1
			};

			render(IngredientItem, { ingredient: longNameIngredient, recipeId: 1 });

			const ingredientName = await page.getByText(
				'2 cups of all-purpose flour, sifted and measured correctly'
			);
			await expect.element(ingredientName).toBeInTheDocument();
		});
	});

	describe('props', () => {
		it('should accept ingredient prop', () => {
			const { container } = render(IngredientItem, { ingredient: mockIngredient, recipeId: 1 });

			const span = container.querySelector('span');
			expect(span?.textContent).toBe(mockIngredient.name);
		});
	});
});
