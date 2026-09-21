import type { Ingredient } from '$lib/server/types';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import IngredientItem from './IngredientItem.svelte';

describe('IngredientItem.svelte', () => {
	const ingredient: Ingredient = { id: 1, name: '2 cups flour', recipeId: 1 };
	const props = {
		ingredient,
		recipeId: 1,
		recipeSlug: 'test-recipe',
		isEditing: false,
		onEditStart: vi.fn(),
		onEditEnd: vi.fn()
	};

	it('renders an ingredient in read mode', async () => {
		render(IngredientItem, props);

		await expect.element(page.getByText('2 cups flour')).toBeInTheDocument();
		await expect.element(page.getByTitle('Delete ingredient')).toBeInTheDocument();
	});

	it('enters edit mode with the ingredient and actions available', async () => {
		const { rerender } = render(IngredientItem, {
			...props,
			onEditStart: () => rerender({ isEditing: true })
		});

		await page.getByText('2 cups flour').click();

		await expect.element(page.getByRole('textbox')).toHaveValue('2 cups flour');
		await expect.element(page.getByTitle('Save ingredient')).toBeInTheDocument();
		await expect.element(page.getByTitle('Cancel edit')).toBeInTheDocument();
	});
});
