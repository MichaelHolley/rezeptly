import { expect, test as setup } from '@playwright/test';

const sessionFile = 'e2e/.auth/session.json';

setup('authenticate', async ({ page }) => {
	const password = process.env.AUTH_PASSWORD;
	if (!password) throw new Error('AUTH_PASSWORD is not set');

	await page.goto('/auth');
	await page.getByPlaceholder('Password').fill(password);
	await page.getByRole('button', { name: 'Login' }).click();

	await page.waitForURL('/');
	await expect(page.getByPlaceholder('Password')).toHaveCount(0);

	await page.context().storageState({ path: sessionFile });
});
