<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Snippet } from 'svelte';

	const {
		onSelect,
		active,
		children
	}: {
		active?: boolean;
		onSelect?: () => void;
		children?: Snippet;
	} = $props();
</script>

<Badge
	variant={active ? 'default' : 'secondary'}
	class={onSelect && 'hover:cursor-pointer'}
	onclick={onSelect}
>
	{#if children}
		{@render children()}
	{/if}
</Badge>
