import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

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
	const password = process.env.AUTH_PASSWORD;
	if (!password) throw new Error('AUTH_PASSWORD is not set');

	await page.goto('/create');
	await page.getByPlaceholder('Password').fill(password);
	await page.getByRole('button', { name: 'Login' }).click();

	await expect(page).toHaveURL('/create');
	await expect(page.getByPlaceholder('Password')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});
