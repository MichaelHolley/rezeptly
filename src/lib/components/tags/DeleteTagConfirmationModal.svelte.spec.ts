import type { Tag } from '$lib/server/types';
import { AvailableTagsStore } from '$lib/store/available-tags.svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import DeleteTagConfirmationModal from './DeleteTagConfirmationModal.svelte';

describe('DeleteTagConfirmationModal.svelte', () => {
	const dessert: Tag = { id: 1, name: 'Dessert', slug: 'dessert', category: 'type' };
	const italian: Tag = { id: 2, name: 'Italian', slug: 'italian', category: 'cuisine' };

	beforeEach(() => {
		AvailableTagsStore.tags = [dessert, italian];
	});

	afterEach(() => {
		AvailableTagsStore.tags = [];
	});

	it('should submit the selected migration target', async () => {
		render(DeleteTagConfirmationModal, { tagId: 1, tagName: 'Dessert', recipeCount: 2 });
		await page.getByRole('button', { name: 'Delete Dessert' }).click();

		await page.getByRole('combobox', { name: 'Move recipes to' }).click();
		await page.getByRole('button', { name: 'Italian (Cuisine)', exact: true }).click();

		await expect.element(page.getByRole('button', { name: 'Move & Delete' })).toBeInTheDocument();
		expect(document.querySelector('input[type="hidden"][value="2"]')).not.toBeNull();
	});
});
