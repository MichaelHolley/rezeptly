import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import TagCategorySelectComponent from './TagCategorySelectComponent.svelte';

describe('TagCategorySelectComponent.svelte', () => {
	describe('rendering', () => {
		it('should render an option per tag category', async () => {
			const { container } = render(TagCategorySelectComponent);

			const options = container.querySelectorAll('option');
			expect([...options].map((o) => o.value)).toEqual(['type', 'cuisine', 'nutrition', 'diet']);
		});

		it('should default to the type category', async () => {
			const { container } = render(TagCategorySelectComponent);

			expect(container.querySelector('select')?.value).toBe('type');
		});

		it('should preselect the provided value', async () => {
			const { container } = render(TagCategorySelectComponent, { value: 'diet' });

			expect(container.querySelector('select')?.value).toBe('diet');
		});
	});

	describe('interaction', () => {
		it('should update the selection when another category is picked', async () => {
			const { container } = render(TagCategorySelectComponent);

			await page.getByRole('combobox').selectOptions('cuisine');

			expect(container.querySelector('select')?.value).toBe('cuisine');
		});
	});
});
