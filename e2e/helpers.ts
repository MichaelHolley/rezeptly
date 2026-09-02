import { expect, type Page } from '@playwright/test';

export const uniqueName = (prefix: string) =>
	`${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Creates a recipe through the create form and returns the slug it redirected to. */
export async function createRecipe(
	page: Page,
	name: string,
	description = 'Created by the Playwright e2e suite'
): Promise<string> {
	await page.goto('/create');
	await page.getByLabel('Name').fill(name);
	await page.getByLabel('Description').fill(description);
	await page.getByRole('button', { name: '+ Create' }).click();

	await expect(page.getByRole('heading', { name })).toBeVisible();

	return new URL(page.url()).pathname.slice(1);
}
