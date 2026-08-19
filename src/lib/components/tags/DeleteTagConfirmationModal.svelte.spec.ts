import type { Tag } from '$lib/server/types';
import { AvailableTagsStore } from '$lib/store/available-tags.svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import DeleteTagConfirmationModal from './DeleteTagConfirmationModal.svelte';

describe('DeleteTagConfirmationModal.svelte', () => {
	const submitSpy = vi.fn();

	const dessert: Tag = { id: 1, name: 'Dessert', slug: 'dessert', category: 'type' };
	const italian: Tag = { id: 2, name: 'Italian', slug: 'italian', category: 'cuisine' };

	beforeEach(() => {
		document.addEventListener('submit', submitSpy);
		AvailableTagsStore.tags = [dessert, italian];
	});

	afterEach(() => {
		document.removeEventListener('submit', submitSpy);
		submitSpy.mockClear();
		AvailableTagsStore.tags = [];
	});

	const openDialog = async () => {
		render(DeleteTagConfirmationModal, { tagId: 1, tagName: 'Dessert', recipeCount: 2 });
		await page.getByRole('button', { name: 'Delete Dessert' }).click();
	};

	it('should open the confirmation dialog from the trigger', async () => {
		await openDialog();

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();
		await expect.element(page.getByText('Delete "Dessert"?')).toBeInTheDocument();
	});

	it('should close the dialog on cancel without submitting the form', async () => {
		await openDialog();

		await page.getByRole('button', { name: 'Cancel' }).click();

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
		expect(submitSpy).not.toHaveBeenCalled();
	});

	it('should submit the form on delete', async () => {
		await openDialog();

		await page.getByRole('button', { name: 'Delete', exact: true }).click();

		expect(submitSpy).toHaveBeenCalled();
	});

	it('should submit the selected migration target', async () => {
		await openDialog();

		await page.getByRole('combobox', { name: 'Move recipes to' }).click();
		await page.getByRole('button', { name: 'Italian (Cuisine)', exact: true }).click();

		await expect.element(page.getByRole('button', { name: 'Move & Delete' })).toBeInTheDocument();
		expect(document.querySelector('input[type="hidden"][value="2"]')).not.toBeNull();
	});
});
