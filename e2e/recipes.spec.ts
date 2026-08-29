import { expect, test } from '@playwright/test';

const seededRecipe = 'Classic Scrambled Eggs';
const seededDraft = 'Caprese Salad';

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

test('keeps drafts out of the recipe list and shows them on the drafts page', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText(seededDraft)).toHaveCount(0);

	await page.goto('/drafts');
	await expect(page.getByText(seededDraft)).toBeVisible();
	await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible();
});

test('filters the recipe list by search term', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText(seededRecipe).first()).toBeVisible();

	await page.getByPlaceholder('Search...').fill('pizza');

	await expect(page.getByText('Homemade Margherita Pizza')).toBeVisible();
	await expect(page.getByText(seededRecipe)).toHaveCount(0);

	await page.getByLabel('Clear search').click();
	await expect(page.getByText(seededRecipe).first()).toBeVisible();
});

test('filters the recipe list by course', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('combobox').filter({ hasText: 'Course' }).click();
	await page.getByRole('checkbox', { name: 'Dessert' }).click();
	await page.keyboard.press('Escape');

	await expect(page.getByText('Classic Chocolate Chip Cookies')).toBeVisible();
	await expect(page.getByText(seededRecipe)).toHaveCount(0);
});
