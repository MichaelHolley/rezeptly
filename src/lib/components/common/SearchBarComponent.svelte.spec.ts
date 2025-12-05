import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import SearchBarComponent from './SearchBarComponent.svelte';

describe('SearchBarComponent.svelte', () => {
	describe('rendering', () => {
		it('should render with default placeholder', async () => {
			const { container } = render(SearchBarComponent, { searchTerm: '' });

			const input = container.querySelector('input');
			expect(input).toBeTruthy();
			expect(input?.placeholder).toBe('Search...');
		});

		it('should render with custom placeholder', async () => {
			const { container } = render(SearchBarComponent, {
				searchTerm: '',
				placeholder: 'Find recipes...'
			});

			const input = container.querySelector('input');
			expect(input?.placeholder).toBe('Find recipes...');
		});

		it('should render with initial searchTerm value', async () => {
			const { container } = render(SearchBarComponent, { searchTerm: 'pasta' });

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input?.value).toBe('pasta');
		});

		it('should be a text input type', async () => {
			const { container } = render(SearchBarComponent, { searchTerm: '' });

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input?.type).toBe('text');
		});

		it('should be focusable', async () => {
			const { container } = render(SearchBarComponent, { searchTerm: '' });

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input).toBeTruthy();
			expect(input?.tabIndex).toBeGreaterThanOrEqual(0);
		});
	});

	describe('user interaction', () => {
		it('should update searchTerm when user types', async () => {
			let searchTerm = $state('');
			render(SearchBarComponent, {
				get searchTerm() {
					return searchTerm;
				},
				set searchTerm(v) {
					searchTerm = v;
				}
			});

			const input = page.getByPlaceholder('Search...');
			await input.fill('chicken');

			await expect.poll(() => searchTerm).toBe('chicken');
		});

		it('should clear searchTerm when input is cleared', async () => {
			let searchTerm = $state('initial value');
			render(SearchBarComponent, {
				get searchTerm() {
					return searchTerm;
				},
				set searchTerm(v) {
					searchTerm = v;
				}
			});

			const input = page.getByPlaceholder('Search...');
			await input.fill('');

			await expect.poll(() => searchTerm).toBe('');
		});

		it('should handle multiple character input', async () => {
			let searchTerm = $state('');
			render(SearchBarComponent, {
				get searchTerm() {
					return searchTerm;
				},
				set searchTerm(v) {
					searchTerm = v;
				}
			});

			const input = page.getByPlaceholder('Search...');
			await input.fill('chocolate cake recipe');

			await expect.poll(() => searchTerm).toBe('chocolate cake recipe');
		});

		it('should handle special characters in search term', async () => {
			let searchTerm = $state('');
			render(SearchBarComponent, {
				get searchTerm() {
					return searchTerm;
				},
				set searchTerm(v) {
					searchTerm = v;
				}
			});

			const input = page.getByPlaceholder('Search...');
			await input.fill('café & crème');

			await expect.poll(() => searchTerm).toBe('café & crème');
		});
	});

	describe('styling', () => {
		it('should apply custom className', async () => {
			const { container } = render(SearchBarComponent, {
				searchTerm: '',
				class: 'custom-search-class'
			});

			const input = container.querySelector('input');
			expect(input?.className).toContain('custom-search-class');
		});
	});
});
