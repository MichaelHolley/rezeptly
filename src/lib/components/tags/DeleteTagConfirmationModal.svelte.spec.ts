import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import DeleteTagConfirmationModal from './DeleteTagConfirmationModal.svelte';

describe('DeleteTagConfirmationModal.svelte', () => {
	const submitSpy = vi.fn();

	beforeEach(() => {
		document.addEventListener('submit', submitSpy);
	});

	afterEach(() => {
		document.removeEventListener('submit', submitSpy);
		submitSpy.mockClear();
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
});
