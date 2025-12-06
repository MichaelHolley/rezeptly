<script lang="ts">
	import { cn } from '$lib/utils';
	import TagComponent from './TagComponent.svelte';

	const { tags, class: className }: { tags: string[]; class?: string } = $props();
</script>

<div class={cn('flex flex-row flex-wrap gap-2', className)}>
	{#each tags as tag (tag)}
		<TagComponent>{tag}</TagComponent>
	{/each}
</div>
