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
