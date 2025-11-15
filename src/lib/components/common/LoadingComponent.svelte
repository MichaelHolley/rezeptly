<script lang="ts">
	import { cn } from '$lib/utils';
	import LoaderIcon from '@lucide/svelte/icons/loader';

	const { hidden }: { hidden?: boolean } = $props();
</script>

<LoaderIcon
	class={cn('animate-spin text-neutral-400', hidden && 'hidden')}
	style="animation-duration: 2s;"
/>
