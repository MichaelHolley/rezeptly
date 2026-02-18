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

	const mockRecipeSlug = 'test-recipe';

	describe('rendering', () => {
		it('should render ingredient name', async () => {
			render(IngredientItem, {
				ingredient: mockIngredient,
				recipeId: 1,
				recipeSlug: mockRecipeSlug
			});

			const ingredientName = await page.getByText('2 cups flour');
			await expect.element(ingredientName).toBeInTheDocument();
		});

		it('should show delete button by default', async () => {
			render(IngredientItem, {
				ingredient: mockIngredient,
				recipeId: 1,
				recipeSlug: mockRecipeSlug
			});

			const deleteButton = await page.getByTitle('Delete ingredient');
			await expect.element(deleteButton).toBeInTheDocument();
		});

		it('should render ingredient with special characters', async () => {
			const specialIngredient: Ingredient = {
				id: 2,
				name: '½ cup milk & cream',
				recipeId: 1
			};

			render(IngredientItem, {
				ingredient: specialIngredient,
				recipeId: 1,
				recipeSlug: mockRecipeSlug
			});

			const ingredientName = await page.getByText('½ cup milk & cream');
			await expect.element(ingredientName).toBeInTheDocument();
		});

		it('should render ingredient with long name', async () => {
			const longNameIngredient: Ingredient = {
				id: 3,
				name: '2 cups of all-purpose flour, sifted and measured correctly',
				recipeId: 1
			};

			render(IngredientItem, {
				ingredient: longNameIngredient,
				recipeId: 1,
				recipeSlug: mockRecipeSlug
			});

			const ingredientName = await page.getByText(
				'2 cups of all-purpose flour, sifted and measured correctly'
			);
			await expect.element(ingredientName).toBeInTheDocument();
		});
	});

	describe('edit mode', () => {
		it('should show form when ingredient name is clicked', async () => {
			const { container } = render(IngredientItem, {
				ingredient: mockIngredient,
				recipeId: 1,
				recipeSlug: mockRecipeSlug
			});

			const nameButton = await page.getByText('2 cups flour');
			await nameButton.click();

			const form = container.querySelector('form');
			expect(form).toBeTruthy();
		});

		it('should show input field when ingredient name is clicked', async () => {
			render(IngredientItem, {
				ingredient: mockIngredient,
				recipeId: 1,
				recipeSlug: mockRecipeSlug
			});

			const nameButton = await page.getByText('2 cups flour');
			await nameButton.click();

			const input = page.getByRole('textbox');
			await expect.element(input).toBeInTheDocument();
		});

		it('should show save and cancel buttons in edit mode', async () => {
			render(IngredientItem, {
				ingredient: mockIngredient,
				recipeId: 1,
				recipeSlug: mockRecipeSlug
			});

			const nameButton = await page.getByText('2 cups flour');
			await nameButton.click();

			const saveButton = await page.getByTitle('Save ingredient');
			await expect.element(saveButton).toBeInTheDocument();

			const cancelButton = await page.getByTitle('Cancel edit');
			await expect.element(cancelButton).toBeInTheDocument();
		});

		it('should display ingredient name in input when editing', async () => {
			render(IngredientItem, {
				ingredient: mockIngredient,
				recipeId: 1,
				recipeSlug: mockRecipeSlug
			});

			const nameButton = await page.getByText('2 cups flour');
			await nameButton.click();

			const input = page.getByRole('textbox');
			await expect.element(input).toHaveValue('2 cups flour');
		});
	});
});
