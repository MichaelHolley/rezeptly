import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
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
});
