<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Snippet } from 'svelte';

	const {
		onClick,
		active,
		children
	}: {
		active?: boolean;
		onClick?: () => void;
		children?: Snippet;
	} = $props();
</script>

<Badge
	variant={active ? 'default' : 'secondary'}
	class={onClick && 'hover:cursor-pointer'}
	onclick={onClick}
>
	{#if children}
		{@render children()}
	{/if}
</Badge>
