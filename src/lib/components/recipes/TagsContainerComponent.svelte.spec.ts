import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import TagsContainerComponent from './TagsContainerComponent.svelte';

describe('TagsContainerComponent.svelte', () => {
	describe('rendering', () => {
		it('should render all tags', async () => {
			render(TagsContainerComponent, { tags: ['Italian', 'Vegan', 'Quick'] });

			await expect.element(page.getByText('Italian')).toBeInTheDocument();
			await expect.element(page.getByText('Vegan')).toBeInTheDocument();
			await expect.element(page.getByText('Quick')).toBeInTheDocument();
		});

		it('should render nothing when tags is empty', async () => {
			const { container } = render(TagsContainerComponent, { tags: [] });

			const badges = container.querySelectorAll('[data-slot="badge"]');
			expect(badges.length).toBe(0);
		});

		it('should render single tag', async () => {
			render(TagsContainerComponent, { tags: ['Italian'] });
			await expect.element(page.getByText('Italian')).toBeInTheDocument();
		});
	});
});
