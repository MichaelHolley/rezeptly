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
	const vegan: Tag = { id: 3, name: 'Vegan', slug: 'vegan', category: 'diet' };

	beforeEach(() => {
		document.addEventListener('submit', submitSpy);
		AvailableTagsStore.tags = [dessert, italian, vegan];
	});

	afterEach(() => {
		document.removeEventListener('submit', submitSpy);
		submitSpy.mockClear();
		AvailableTagsStore.tags = [];
	});

	const openDialog = async (props: Record<string, unknown> = {}) => {
		render(DeleteTagConfirmationModal, {
			tagId: 1,
			tagName: 'Dessert',
			recipeCount: 2,
			...props
		});
		await page.getByRole('button', { name: 'Delete Dessert' }).click();
	};

	const selectTarget = async (name: string) => {
		await page.getByRole('combobox', { name: 'Move recipes to' }).click();
		await page.getByRole('button', { name }).click();
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

	it('should hide the migration select when the tag has no recipes', async () => {
		await openDialog({ recipeCount: 0 });

		await expect
			.element(page.getByRole('combobox', { name: 'Move recipes to' }))
			.not.toBeInTheDocument();
	});

	it('should hide the migration select when no other tag exists', async () => {
		AvailableTagsStore.tags = [dessert];

		await openDialog();

		await expect
			.element(page.getByRole('combobox', { name: 'Move recipes to' }))
			.not.toBeInTheDocument();
	});

	it('should offer targets from every category, labelled with their category', async () => {
		await openDialog();

		await page.getByRole('combobox', { name: 'Move recipes to' }).click();

		await expect
			.element(page.getByRole('button', { name: 'Italian (Cuisine)', exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Vegan (Diet)', exact: true }))
			.toBeInTheDocument();
	});

	it('should not offer the tag being deleted as a target', async () => {
		await openDialog();

		await page.getByRole('combobox', { name: 'Move recipes to' }).click();

		await expect
			.element(page.getByRole('button', { name: 'Italian (Cuisine)', exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Dessert (Type)', exact: true }))
			.not.toBeInTheDocument();
	});

	it('should name the target and its category once a target is selected', async () => {
		await openDialog();

		await selectTarget('Italian (Cuisine)');

		await expect
			.element(
				page.getByText('The 2 recipes will be moved to "Italian" (Cuisine)', { exact: false })
			)
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Move & Delete' })).toBeInTheDocument();
	});

	it('should submit the target tag only once one is selected', async () => {
		await openDialog();

		expect(document.querySelector('input[type="hidden"][value="3"]')).toBeNull();

		await selectTarget('Vegan (Diet)');

		expect(document.querySelector('input[type="hidden"][value="3"]')).not.toBeNull();
	});
});
