import { expect, test } from '@playwright/test';
import { createRecipe, uniqueName } from './helpers';

test('recipe list shows published recipes', async ({ page }) => {
	const name = uniqueName('E2E Published Recipe');
	await createRecipe(page, name, { published: true });
	await page.goto('/');

	await expect(page.getByText(name)).toBeVisible();
});

test('opens a recipe detail page', async ({ page }) => {
	const name = uniqueName('E2E Recipe Details');
	await createRecipe(page, name, { published: true });
	await page.goto('/');

	await page.getByText(name).click();

	await expect(page.getByRole('heading', { name })).toBeVisible();
	await expect(page).not.toHaveURL('/');
});

test('keeps drafts out of the recipe list and shows them on the drafts page', async ({ page }) => {
	const name = uniqueName('E2E Draft Recipe');
	await createRecipe(page, name);

	await page.goto('/');
	await expect(page.getByText(name)).toHaveCount(0);

	await page.goto('/drafts');
	await expect(page.getByText(name)).toBeVisible();
	await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible();
});

test('filters the recipe list by search term', async ({ page }) => {
	const pizza = uniqueName('E2E Search Pizza');
	const salad = uniqueName('E2E Search Salad');
	await createRecipe(page, pizza, { published: true });
	await createRecipe(page, salad, { published: true });

	await page.goto('/');
	await expect(page.getByText(salad)).toBeVisible();

	await page.getByPlaceholder('Search...').fill('pizza');

	await expect(page.getByText(pizza)).toBeVisible();
	await expect(page.getByText(salad)).toHaveCount(0);

	await page.getByLabel('Clear search').click();
	await expect(page.getByText(salad)).toBeVisible();
});

test('filters the recipe list by course', async ({ page }) => {
	const dessert = uniqueName('E2E Dessert Recipe');
	const main = uniqueName('E2E Main Recipe');
	await createRecipe(page, dessert, { course: 'Dessert', published: true });
	await createRecipe(page, main, { course: 'Main Course', published: true });

	await page.goto('/');

	await page.getByRole('combobox').filter({ hasText: 'Course' }).click();
	await page.getByRole('checkbox', { name: 'Dessert' }).click();
	await page.keyboard.press('Escape');

	await expect(page.getByText(dessert)).toBeVisible();
	await expect(page.getByText(main)).toHaveCount(0);
});
