<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';

	let { children } = $props();

	onNavigate((navigate) => {
		if (!document.startViewTransition) return;

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
