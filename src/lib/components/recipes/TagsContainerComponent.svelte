<script lang="ts">
	import TagComponent from './TagComponent.svelte';

	const { tags, class: className } = $props<{ tags: string[]; class?: string }>();
</script>

<div class="flex flex-row flex-wrap gap-2 {className}">
	{#each tags as tag}
		<TagComponent {tag} />
	{/each}
</div>
