import { expect, test } from '@playwright/test';
import { createRecipe, uniqueName } from './helpers';

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
});

test('adds and removes an ingredient', async ({ page }) => {
	const name = uniqueName('E2E Ingredient Recipe');

	await createRecipe(page, name);

	await page.locator('button[title="Edit Ingredients"]:visible').click();
	await page.getByPlaceholder('Ingredient & Quantity').fill('2 cups of flour');
	await page.getByPlaceholder('Ingredient & Quantity').press('Enter');

	await expect(page.getByTitle('Edit ingredient', { exact: true })).toHaveText('2 cups of flour');

	await page.getByTitle('Delete ingredient').click();
	await expect(page.getByTitle('Edit ingredient', { exact: true })).toHaveCount(0);
});

test('groups and reorders ingredients', async ({ page }) => {
	const name = uniqueName('E2E Grouped Ingredient Recipe');

	await createRecipe(page, name);
	await page.locator('button[title="Edit Ingredients"]:visible').click();

	const ungrouped = page.getByRole('region', { name: 'Ungrouped ingredients' });
	await ungrouped.getByPlaceholder('Ingredient & Quantity').fill('Salt');
	await ungrouped.getByPlaceholder('Ingredient & Quantity').press('Enter');

	await page.getByPlaceholder('New section').fill('Dough');
	await page.getByTitle('Add ingredient section').click();
	await page.getByPlaceholder('New section').fill('Sauce');
	await page.getByTitle('Add ingredient section').click();

	const dough = page.getByRole('region', { name: 'Dough ingredients' });
	const sauce = page.getByRole('region', { name: 'Sauce ingredients' });
	await dough.getByPlaceholder('Ingredient & Quantity').fill('Flour');
	await dough.getByPlaceholder('Ingredient & Quantity').press('Enter');
	await dough.getByPlaceholder('Ingredient & Quantity').fill('Water');
	await dough.getByPlaceholder('Ingredient & Quantity').press('Enter');
	await sauce.getByPlaceholder('Ingredient & Quantity').fill('Tomato');
	await sauce.getByPlaceholder('Ingredient & Quantity').press('Enter');

	await sauce.getByLabel('Move section Sauce').click();
	await page.getByRole('menuitem', { name: 'Move section up' }).click();

	await ungrouped.getByLabel('Move Salt').click();
	await page.getByRole('menuitem', { name: 'Move to section' }).hover();
	await page.getByRole('menuitem', { name: 'Sauce' }).click();

	await dough.getByLabel('Move Water').click();
	await page.getByRole('menuitem', { name: 'Move up', exact: true }).click();

	await dough.getByLabel('Drag Water').dragTo(dough.getByLabel('Drag Flour'));

	await sauce.getByTitle('Edit section').click();
	await sauce.getByLabel('Section name').fill('Tomato sauce');
	await sauce.getByTitle('Save section name').click();
	await page.locator('button[data-slot="button"]', { hasText: 'Close' }).click();

	await expect(page.getByRole('heading', { name: 'Tomato sauce' }).first()).toBeVisible();
	await page.reload();
	await page.locator('button[title="Edit Ingredients"]:visible').click();

	const sections = page.locator('[aria-label$=" ingredients"]');
	await expect(sections.nth(1)).toHaveAttribute('aria-label', 'Tomato sauce ingredients');
	await expect(sections.nth(2)).toHaveAttribute('aria-label', 'Dough ingredients');
	await expect(
		page
			.getByRole('region', { name: 'Tomato sauce ingredients' })
			.getByTitle('Edit ingredient', { exact: true })
	).toHaveText(['Tomato', 'Salt']);
});

test('deleting a section preserves its ingredients as ungrouped', async ({ page }) => {
	const name = uniqueName('E2E Delete Ingredient Section');

	await createRecipe(page, name);
	await page.locator('button[title="Edit Ingredients"]:visible').click();
	const ungrouped = page.getByRole('region', { name: 'Ungrouped ingredients' });
	await ungrouped.getByPlaceholder('Ingredient & Quantity').fill('Salt');
	await ungrouped.getByPlaceholder('Ingredient & Quantity').press('Enter');
	await page.getByPlaceholder('New section').fill('Sauce');
	await page.getByTitle('Add ingredient section').click();

	const sauce = page.getByRole('region', { name: 'Sauce ingredients' });
	for (const ingredient of ['Tomato', 'Garlic']) {
		await sauce.getByPlaceholder('Ingredient & Quantity').fill(ingredient);
		await sauce.getByPlaceholder('Ingredient & Quantity').press('Enter');
	}
	await sauce.getByTitle('Delete section').click();

	await expect(ungrouped.getByTitle('Edit ingredient', { exact: true })).toHaveText([
		'Salt',
		'Tomato',
		'Garlic'
	]);
	await page.reload();
	await page.locator('button[title="Edit Ingredients"]:visible').click();
	await expect(
		page
			.getByRole('region', { name: 'Ungrouped ingredients' })
			.getByTitle('Edit ingredient', { exact: true })
	).toHaveText(['Salt', 'Tomato', 'Garlic']);
});

test('adds instruction steps', async ({ page }) => {
	const name = uniqueName('E2E Instructions Recipe');

	await createRecipe(page, name);

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
});

test('deletes a recipe', async ({ page }) => {
	const name = uniqueName('E2E Delete Recipe');

	await createRecipe(page, name);

	await page.getByTitle('Delete Recipe').click();
	await page.getByRole('button', { name: 'Delete', exact: true }).click();
	await page.waitForURL('/');

	await page.goto('/drafts');
	await expect(page.getByText(name)).toHaveCount(0);
});
