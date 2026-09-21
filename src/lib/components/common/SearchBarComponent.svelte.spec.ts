import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import SearchBarComponent from './SearchBarComponent.svelte';

describe('SearchBarComponent.svelte', () => {
	it('updates and clears the bound search term', async () => {
		let searchTerm = $state('pasta');
		render(SearchBarComponent, {
			get searchTerm() {
				return searchTerm;
			},
			set searchTerm(value) {
				searchTerm = value;
			},
			placeholder: 'Find recipes...'
		});

		const input = page.getByPlaceholder('Find recipes...');
		await expect.element(input).toHaveValue('pasta');
		await input.fill('chicken');
		await expect.poll(() => searchTerm).toBe('chicken');
		await page.getByLabelText('Clear search').click();
		await expect.poll(() => searchTerm).toBe('');
	});
});
