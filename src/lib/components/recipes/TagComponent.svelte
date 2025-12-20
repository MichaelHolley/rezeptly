<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Snippet } from 'svelte';

	const {
		onSelect,
		active,
		children,
		viewTransitionName
	}: {
		active?: boolean;
		onSelect?: () => void;
		children?: Snippet;
		viewTransitionName?: string;
	} = $props();
</script>

<Badge
	variant={active ? 'default' : 'secondary'}
	class={onSelect && 'hover:cursor-pointer'}
	onclick={onSelect}
	{viewTransitionName}
>
	{#if children}
		{@render children()}
	{/if}
</Badge>
