<script lang="ts">
	import type { Ingredient } from '$lib/server/types';

	const { ingredients, class: className } = $props<{
		ingredients: Ingredient[];
		class?: string;
	}>();
</script>

<div class={className}>
	<ul class="max-w-sm space-y-2">
		{#each ingredients as ingredient}
			<li class="flex flex-row items-center justify-between gap-6">
				<span class="grow text-sm font-medium text-wrap">{ingredient.name}</span>
			</li>
		{/each}
	</ul>
</div>
