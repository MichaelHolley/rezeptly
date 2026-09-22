<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn, viewTransition } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const {
		onSelect,
		active,
		children,
		viewTransitionName,
		class: className
	}: {
		active?: boolean;
		onSelect?: () => void;
		children?: Snippet;
		viewTransitionName?: string;
		class?: string;
	} = $props();
</script>

<Badge
	variant={active ? 'default' : 'secondary'}
	class={cn(onSelect && 'hover:cursor-pointer', className)}
	onclick={onSelect}
	{@attach viewTransition(viewTransitionName)}
>
	{#if children}
		{@render children()}
	{/if}
</Badge>
