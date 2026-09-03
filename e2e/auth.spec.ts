import { expect, test } from '@playwright/test';
import { createRecipe, uniqueName } from './helpers';

test.use({ storageState: { cookies: [], origins: [] } });

const login = async (page: import('@playwright/test').Page, path = '/auth') => {
	const password = process.env.AUTH_PASSWORD;
	if (!password) throw new Error('AUTH_PASSWORD is not set');

	await page.goto(path);
	await page.getByPlaceholder('Password').fill(password);
	await page.getByRole('button', { name: 'Login' }).click();
};

test('redirects unauthenticated visitors from protected routes to login', async ({ page }) => {
	await page.goto('/create');

	await expect(page).toHaveURL('/auth?returnTo=%2Fcreate');
	await expect(page.getByPlaceholder('Password')).toBeVisible();
});

test('rejects a wrong password and stays unauthenticated', async ({ page }) => {
	await page.goto('/auth');
	await page.getByPlaceholder('Password').fill('definitely-wrong');
	await page.getByRole('button', { name: 'Login' }).click();

	await expect(page.getByText('Invalid password')).toBeVisible();
	await expect(page).toHaveURL('/auth');

	await page.goto('/create');
	await expect(page).toHaveURL('/auth?returnTo=%2Fcreate');
});

test('logs in and returns to the requested route', async ({ page }) => {
	await login(page, '/create');

	await expect(page).toHaveURL('/create');
	await expect(page.getByPlaceholder('Password')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});

test('keeps write permissions after a full page reload', async ({ page }) => {
	await login(page);
	await expect(page).toHaveURL('/');

	const slug = await createRecipe(page, uniqueName('E2E Auth Reload'), { published: true });

	await page.goto(`/${slug}`);

	await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Drafts' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Unpublish' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Edit Recipe Details' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Delete Recipe' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Edit instructions' })).toBeVisible();
});
