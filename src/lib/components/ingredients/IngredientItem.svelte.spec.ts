import type { Ingredient } from '$lib/server/types';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import IngredientItem from './IngredientItem.svelte';

const mockIngredient: Ingredient = {
	id: 1,
	name: '2 cups flour',
	ingredientOrder: 1,
	recipeId: 1,
	sectionId: null
};

function props(isEditing = false) {
	return {
		ingredient: mockIngredient,
		recipeId: 1,
		isEditing,
		onEditStart: vi.fn(),
		onEditEnd: vi.fn(),
		onSaved: vi.fn().mockResolvedValue(undefined),
		canMoveUp: false,
		canMoveDown: true,
		moveTargets: [{ id: 2, name: 'Sauce' }],
		onMoveUp: vi.fn(),
		onMoveDown: vi.fn(),
		onMoveTo: vi.fn()
	};
}

describe('IngredientItem.svelte', () => {
	it('renders editing, movement and deletion controls', async () => {
		render(IngredientItem, props());

		await expect.element(page.getByText('2 cups flour')).toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Drag 2 cups flour' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Move 2 cups flour' }))
			.toBeInTheDocument();
		await expect.element(page.getByTitle('Delete ingredient')).toBeInTheDocument();
	});

	it('starts editing when the ingredient name is clicked', async () => {
		const componentProps = props();
		render(IngredientItem, componentProps);

		await page.getByTitle('Edit ingredient').click();

		expect(componentProps.onEditStart).toHaveBeenCalledOnce();
	});

	it('renders the populated edit form', async () => {
		render(IngredientItem, props(true));

		await expect.element(page.getByRole('textbox')).toHaveValue('2 cups flour');
		await expect.element(page.getByTitle('Save ingredient')).toBeInTheDocument();
		await expect.element(page.getByTitle('Cancel edit')).toBeInTheDocument();
	});
});
