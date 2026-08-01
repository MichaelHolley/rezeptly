import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import DraftBadgeComponent from './DraftBadgeComponent.svelte';

describe('DraftBadgeComponent.svelte', () => {
	it('should render the badge for a draft recipe', async () => {
		render(DraftBadgeComponent, { publishedAt: null });
		await expect.element(page.getByText('Draft')).toBeInTheDocument();
	});

	it('should render nothing for a released recipe', async () => {
		render(DraftBadgeComponent, { publishedAt: new Date('2026-01-01') });
		await expect.element(page.getByText('Draft')).not.toBeInTheDocument();
	});
});
