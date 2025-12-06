<script lang="ts">
	import { cn } from '$lib/utils';
	import LoaderIcon from '@lucide/svelte/icons/loader';

	const { class: className }: { class?: string } = $props();
</script>

<LoaderIcon
	class={cn('animate-spin text-neutral-400', className)}
	style="animation-duration: 2s;"
/>
