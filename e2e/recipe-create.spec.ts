import { expect, test } from '@playwright/test';
import { createRecipe, uniqueName } from './helpers';

test('creates a recipe as a draft', async ({ page }) => {
	const name = uniqueName('E2E Draft Recipe');

	await createRecipe(page, name);

	await expect(page.getByText('Draft', { exact: true })).toBeVisible();

	await page.goto('/drafts');
	await expect(page.getByText(name)).toBeVisible();

	await page.goto('/');
	await expect(page.getByText(name)).toHaveCount(0);
});

test('publishes a draft and unpublishes it again', async ({ page }) => {
	const name = uniqueName('E2E Publish Recipe');

	const slug = await createRecipe(page, name);

	await page.getByRole('button', { name: 'Publish' }).click();
	await expect(page.getByRole('button', { name: 'Unpublish' })).toBeVisible();
	await expect(page.getByText('Draft', { exact: true })).toHaveCount(0);

	await page.goto('/');
	await expect(page.getByText(name)).toBeVisible();

	await page.goto(`/${slug}`);
	await page.getByRole('button', { name: 'Unpublish' }).click();
	await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();

	await page.goto('/');
	await expect(page.getByText(name)).toHaveCount(0);
});

test('creates a recipe with course, duration and a tag', async ({ page }) => {
	const name = uniqueName('E2E Full Recipe');

	await page.goto('/create');
	await page.getByLabel('Name').fill(name);
	await page.getByLabel('Description').fill('Recipe with all optional details filled in');

	await page.getByRole('combobox').filter({ hasText: 'Duration' }).click();
	await page.getByRole('button', { name: '30 min', exact: true }).click();

	await page.getByRole('button', { name: 'Dessert' }).click();

	await page.locator('#tag-input-cuisine').fill('Italian');
	await page.locator('#tag-input-cuisine').press('Enter');

	await page.getByRole('button', { name: '+ Create' }).click();

	await expect(page.getByRole('heading', { name })).toBeVisible();
	await expect(page.getByText('30 min')).toBeVisible();
	await expect(page.getByText('Dessert')).toBeVisible();
	await expect(page.getByText('Italian')).toBeVisible();
});

test('rejects a blank name on the server', async ({ page }) => {
	await page.goto('/create');
	await page.getByLabel('Name').fill('   ');
	await page.getByLabel('Description').fill('Description is fine');
	await page.getByRole('button', { name: '+ Create' }).click();

	await expect(page.getByText('Name is required')).toBeVisible();
	await expect(page).toHaveURL('/create');
});
