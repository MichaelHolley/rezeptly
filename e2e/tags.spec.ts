import { expect, test } from '@playwright/test';
import { uniqueName } from './helpers';

test('creates, renames and deletes a tag', async ({ page }) => {
	const name = uniqueName('E2E Tag');
	const renamed = `${name} Renamed`;

	await page.goto('/tags');

	await page.getByLabel('Tag name').first().fill(name);
	await page.getByTitle('Add tag').first().click();

	await expect(page.getByText(name)).toBeVisible();

	await page.getByTitle(`Edit ${name}`).click();
	const editingRow = page.locator('li:has(form)');
	await editingRow.getByLabel('Tag name').fill(renamed);
	await editingRow.getByTitle('Save').click();

	await expect(page.getByText(renamed)).toBeVisible();

	await page.getByTitle(`Delete ${renamed}`).click();
	await page.getByRole('button', { name: 'Delete', exact: true }).click();

	await expect(page.getByText(renamed)).toHaveCount(0);
});
