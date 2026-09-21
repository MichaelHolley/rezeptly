import type { Ingredient } from '$lib/server/types';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import IngredientsList from './IngredientsList.svelte';

describe('IngredientsList.svelte', () => {
	it('renders ingredients in order', () => {
		const ingredients: Ingredient[] = [
			{ id: 1, name: '2 cups flour', recipeId: 1 },
			{ id: 2, name: '½ cup milk & cream', recipeId: 1 },
			{ id: 3, name: "2 tbsp chef's seasoning", recipeId: 1 }
		];
		const { container } = render(IngredientsList, { ingredients });

		expect([...container.querySelectorAll('li span')].map((item) => item.textContent)).toEqual(
			ingredients.map(({ name }) => name)
		);
	});
});
