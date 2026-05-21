import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import TagComponent from './TagComponent.svelte';

const textSnippet = (text: string) =>
	createRawSnippet(() => ({
		render: () => `<span>${text}</span>`,
		setup: () => {}
	}));

describe('TagComponent.svelte', () => {
	describe('rendering', () => {
		it('should render children text', async () => {
			render(TagComponent, { children: textSnippet('Italian') });
			await expect.element(page.getByText('Italian')).toBeInTheDocument();
		});
	});

	describe('interaction', () => {
		it('should call onSelect when clicked', async () => {
			const onSelect = vi.fn();
			render(TagComponent, { onSelect, children: textSnippet('Italian') });
			await page.getByText('Italian').click();
			expect(onSelect).toHaveBeenCalledOnce();
		});

		it('should not call onSelect when no handler provided', async () => {
			render(TagComponent, { children: textSnippet('Italian') });
			await expect.element(page.getByText('Italian')).toBeInTheDocument();
		});
	});
});
