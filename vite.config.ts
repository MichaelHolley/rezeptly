import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
	plugins: [
		tailwindcss(),
		sveltekit(),
		...(mode !== 'test'
			? [
					VitePWA({
						registerType: 'autoUpdate',
						devOptions: { enabled: true },
						includeAssets: ['favicon.svg'],
						manifest: {
							name: 'rezeptly',
							short_name: 'rezeptly',
							description:
								'rezeptly is a web application for managing and organizing your personal recipes.',
							start_url: '/',
							display: 'standalone',
							theme_color: 'oklch(70.5% .213 47.604)',
							icons: [
								{
									src: '/favicon.svg',
									sizes: 'any',
									type: 'image/svg+xml'
								}
							]
						}
					})
				]
			: [])
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					setupFiles: ['./src/test-setup.ts'],
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
}));
