import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { withPwa } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
	plugins: [
		tailwindcss(),
		withPwa(
			{
				preprocess: vitePreprocess(),
				compilerOptions: { experimental: { async: true } },
				adapter: adapter(),
				experimental: { remoteFunctions: true }
			},
			{
				disable: mode === 'test',
				// Kit builds with a relative Vite base, which would make sw.js resolve per route
				base: '/',
				registerType: 'autoUpdate',
				devOptions: { enabled: true },
				includeAssets: ['favicon.svg'],
				// SSR app with no prerendered pages: nothing matches the default `prerendered/**` glob or the `/` fallback
				generateSW: { globStrict: false, navigateFallback: null },
				manifest: {
					name: 'rezeptly',
					short_name: 'rezeptly',
					description:
						'rezeptly is a web application for managing and organizing your personal recipes.',
					start_url: '/',
					display: 'standalone',
					theme_color: 'oklch(70.5% .213 47.604)',
					icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
				}
			}
		),
		devtoolsJson()
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
