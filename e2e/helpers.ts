import { expect, type Locator, type Page } from '@playwright/test';

export const uniqueName = (prefix: string) =>
	`${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

type CreateRecipeOptions = {
	description?: string;
	course?: 'Appetizer' | 'Main Course' | 'Dessert';
	published?: boolean;
};

export async function createRecipe(
	page: Page,
	name: string,
	{
		description = 'Created by the Playwright e2e suite',
		course,
		published = false
	}: CreateRecipeOptions = {}
): Promise<string> {
	await page.goto('/create');
	await page.getByLabel('Name').fill(name);
	await page.getByLabel('Description').fill(description);
	if (course) await page.getByRole('button', { name: course, exact: true }).click();
	await page.getByRole('button', { name: '+ Create' }).click();

	await expect(page.getByRole('heading', { name })).toBeVisible();
	if (published) {
		await page.getByRole('button', { name: 'Publish' }).click();
		await expect(page.getByRole('button', { name: 'Unpublish' })).toBeVisible();
	}

	return new URL(page.url()).pathname.slice(1);
}

/** svelte-dnd-action ignores Playwright's single-jump `dragTo`; it needs gradual pointer moves. */
export async function dragBelow(page: Page, source: Locator, target: Locator) {
	await source.hover();
	const from = (await source.boundingBox())!;
	const to = (await target.boundingBox())!;
	const x = from.x + from.width / 2;
	const startY = from.y + from.height / 2;
	const endY = to.y + to.height;

	await page.mouse.down();
	for (let step = 1; step <= 10; step++) {
		await page.mouse.move(x, startY + ((endY - startY) * step) / 10);
		await page.waitForTimeout(50);
	}
	await page.mouse.up();
}
