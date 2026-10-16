<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
	import '../app.css';

	let { children } = $props();

	onNavigate((navigate) => {
		if (!document.startViewTransition) return;
		// Query-only updates (search, filters) shouldn't animate the whole page
		if (navigate.from?.url.pathname === navigate.to?.url.pathname) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigate.complete;
			});
		});
	});
</script>

<Toaster />
{@render children()}
