import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import RecipeAssistant from './RecipeAssistant.svelte';

describe('RecipeAssistant.svelte', () => {
	afterEach(() => vi.restoreAllMocks());

	it('opens with static guidance without making a request and preserves the draft while closed', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch');
		render(RecipeAssistant, { recipeId: 1, onApplied: vi.fn() });

		await page.getByRole('button', { name: 'Open recipe assistant' }).click();
		await expect.element(page.getByText('What would you like to refine?')).toBeInTheDocument();
		await page.getByPlaceholder('Ask about this recipe…').fill('Make it brighter');
		await page.getByRole('button', { name: 'Close recipe assistant' }).click();
		await page.getByRole('button', { name: 'Open recipe assistant' }).click();

		await expect
			.element(page.getByPlaceholder('Ask about this recipe…'))
			.toHaveValue('Make it brighter');
		expect(fetchSpy).not.toHaveBeenCalled();
	});
});
