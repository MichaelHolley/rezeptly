<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	const { tags, class: className } = $props<{ tags: string[]; class?: string }>();
</script>

<div class="flex flex-row flex-wrap gap-2 {className}">
	{#each tags as tag}
		<Badge variant="secondary">{tag}</Badge>
	{/each}
</div>
