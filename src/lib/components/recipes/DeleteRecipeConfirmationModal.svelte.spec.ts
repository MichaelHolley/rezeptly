import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import DeleteRecipeConfirmationModal from './DeleteRecipeConfirmationModal.svelte';

describe('DeleteRecipeConfirmationModal.svelte', () => {
	const submitSpy = vi.fn();

	beforeEach(() => {
		document.addEventListener('submit', submitSpy);
	});

	afterEach(() => {
		document.removeEventListener('submit', submitSpy);
		submitSpy.mockClear();
	});

	const openDialog = async () => {
		render(DeleteRecipeConfirmationModal, { recipeId: 1 });
		await page.getByRole('button', { name: 'Delete Recipe' }).click();
	};

	it('should open the confirmation dialog from the trigger', async () => {
		await openDialog();

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();
		await expect
			.element(page.getByText('Are you sure you want to delete this recipe?'))
			.toBeInTheDocument();
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
