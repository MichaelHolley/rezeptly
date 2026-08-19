import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('redirects unauthenticated visitors from protected routes to login', async ({ page }) => {
	await page.goto('/create');

	await expect(page).toHaveURL('/auth?returnTo=%2Fcreate');
	await expect(page.getByPlaceholder('Password')).toBeVisible();
});

test('rejects a wrong password', async ({ page }) => {
	await page.goto('/auth');
	await page.getByPlaceholder('Password').fill('definitely-wrong');
	await page.getByRole('button', { name: 'Login' }).click();

	await expect(page).toHaveURL(/\/auth/);
	await expect(page.getByPlaceholder('Password')).toBeVisible();
});
