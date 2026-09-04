import { expect, test } from '@playwright/test';
import { createRecipe, uniqueName } from './helpers';

test('offers a cost-free ephemeral assistant only on drafts', async ({ page }) => {
	const name = uniqueName('E2E Assistant Recipe');
	const slug = await createRecipe(page, name);
	let assistantRequests = 0;
	page.on('request', (request) => {
		if (request.url().includes('/api/recipes/') && request.url().endsWith('/assistant')) {
			assistantRequests += 1;
		}
	});

	await page.getByRole('button', { name: 'Open recipe assistant' }).click();
	await expect(page.getByText('What would you like to refine?')).toBeVisible();
	await page.getByPlaceholder('Ask about this recipe…').fill('Remember this draft');
	await page.getByRole('button', { name: 'Close recipe assistant' }).click();
	await page.getByRole('button', { name: 'Open recipe assistant' }).click();
	await expect(page.getByPlaceholder('Ask about this recipe…')).toHaveValue('Remember this draft');
	expect(assistantRequests).toBe(0);

	await page.goto('/');
	await page.goto(`/${slug}`);
	await page.getByRole('button', { name: 'Open recipe assistant' }).click();
	await expect(page.getByPlaceholder('Ask about this recipe…')).toHaveValue('');
	await page.getByRole('button', { name: 'Close recipe assistant' }).click();

	await page.getByRole('button', { name: 'Publish' }).click();
	await expect(page.getByRole('button', { name: 'Open recipe assistant' })).toHaveCount(0);
});
