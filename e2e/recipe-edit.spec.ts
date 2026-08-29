import { expect, test } from '@playwright/test';
import { createRecipe, deleteRecipe, uniqueName } from './helpers';

test('edits the recipe name and description', async ({ page }) => {
	const name = uniqueName('E2E Edit Recipe');
	const renamed = `${name} Renamed`;

	const slug = await createRecipe(page, name);

	await page.getByTitle('Edit Recipe Details').click();
	await page.getByPlaceholder('Name').fill(renamed);
	await page.getByPlaceholder('Short Recipe Description').fill('Updated by the e2e suite');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByRole('heading', { name: renamed })).toBeVisible();
	await expect(page.getByText('Updated by the e2e suite')).toBeVisible();
	await expect(page).not.toHaveURL(`/${slug}`);

	await deleteRecipe(page, new URL(page.url()).pathname.slice(1));
});

test('adds and removes an ingredient', async ({ page }) => {
	const name = uniqueName('E2E Ingredient Recipe');

	const slug = await createRecipe(page, name);

	await page.locator('button[title="Edit Ingredients"]:visible').click();
	await page.getByPlaceholder('Ingredient & Quantity').fill('2 cups of flour');
	await page.getByPlaceholder('Ingredient & Quantity').press('Enter');

	await expect(page.getByTitle('Edit ingredient', { exact: true })).toHaveText('2 cups of flour');

	await page.getByTitle('Delete ingredient').click();
	await expect(page.getByTitle('Edit ingredient', { exact: true })).toHaveCount(0);

	await deleteRecipe(page, slug);
});

test('adds instruction steps', async ({ page }) => {
	const name = uniqueName('E2E Instructions Recipe');

	const slug = await createRecipe(page, name);

	await page.getByTitle('Edit instructions').click();
	await page.getByRole('button', { name: 'Add Step' }).click();
	await page.getByPlaceholder('Short, descriptive heading').fill('Mix everything');
	await page
		.getByPlaceholder('Start by describing the step in detail...')
		.fill('Put all ingredients in a bowl and stir.');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('Mix everything')).toBeVisible();
	await expect(page.getByText('Put all ingredients in a bowl and stir.')).toBeVisible();

	await page.reload();
	await expect(page.getByText('Mix everything')).toBeVisible();

	await deleteRecipe(page, slug);
});

test('deletes a recipe', async ({ page }) => {
	const name = uniqueName('E2E Delete Recipe');

	const slug = await createRecipe(page, name);

	await deleteRecipe(page, slug);

	await page.goto('/drafts');
	await expect(page.getByText(name)).toHaveCount(0);
});
