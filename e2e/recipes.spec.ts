import { expect, test } from '@playwright/test';

const seededRecipe = 'Classic Scrambled Eggs';

test('recipe list shows seeded recipes', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByText(seededRecipe).first()).toBeVisible();
});

test('opens a recipe detail page', async ({ page }) => {
	await page.goto('/');

	await page.getByText(seededRecipe).first().click();

	await expect(page.getByRole('heading', { name: seededRecipe })).toBeVisible();
	await expect(page).not.toHaveURL('/');
});

test('creates a recipe without an image', async ({ page }) => {
	const name = `E2E Test Recipe ${Date.now()}`;

	await page.goto('/create');
	await page.getByLabel('Name').fill(name);
	await page.getByLabel('Description').fill('Created by the Playwright e2e suite');
	await page.getByRole('button', { name: '+ Create' }).click();

	await expect(page.getByRole('heading', { name })).toBeVisible();
	await expect(page).not.toHaveURL('/create');
});
