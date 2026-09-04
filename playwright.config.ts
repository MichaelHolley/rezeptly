import { defineConfig, devices } from '@playwright/test';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || new URL(databaseUrl).pathname !== '/rezeptly_test') {
	throw new Error('Playwright requires the isolated rezeptly_test database');
}

export default defineConfig({
	testDir: 'e2e',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
	use: {
		baseURL: 'http://localhost:4174',
		trace: 'on-first-retry',
		actionTimeout: 10_000,
		navigationTimeout: 15_000
	},
	webServer: {
		command: 'pnpm build && pnpm preview --port 4174',
		port: 4174,
		reuseExistingServer: false,
		timeout: 180_000
	},
	projects: [
		{
			name: 'setup',
			testMatch: /auth\.setup\.ts/
		},
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				storageState: 'e2e/.auth/session.json'
			},
			dependencies: ['setup']
		}
	]
});
