import { PermissionsStore } from '$lib/store/roles.svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import PublishButtonComponent from './PublishButtonComponent.svelte';

describe('PublishButtonComponent.svelte', () => {
	afterEach(() => {
		PermissionsStore.resetRoles();
	});

	describe('with write permission', () => {
		beforeEach(() => {
			PermissionsStore.roles = ['admin'];
		});

		it('should offer to publish a draft recipe', async () => {
			render(PublishButtonComponent, { recipeId: 1, publishedAt: null });
			await expect.element(page.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
		});

		it('should offer to unpublish a released recipe', async () => {
			render(PublishButtonComponent, { recipeId: 1, publishedAt: new Date('2026-01-01') });
			await expect.element(page.getByRole('button', { name: 'Unpublish' })).toBeInTheDocument();
		});
	});

	describe('without write permission', () => {
		it('should render nothing', async () => {
			render(PublishButtonComponent, { recipeId: 1, publishedAt: null });
			await expect.element(page.getByRole('button')).not.toBeInTheDocument();
		});
	});
});
