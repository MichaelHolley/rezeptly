<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import TagComponent from './TagComponent.svelte';

	const {
		tags,
		viewTransitionPrefix,
		class: className,
		children
	}: {
		tags: string[];
		viewTransitionPrefix?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div class={cn('flex flex-row flex-wrap items-center gap-1', className)}>
	{#each tags as tag (tag)}
		<TagComponent viewTransitionName={`${viewTransitionPrefix}-${tag}`}>{tag}</TagComponent>
	{/each}
	{@render children?.()}
</div>
