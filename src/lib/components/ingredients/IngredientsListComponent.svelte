<script lang="ts">
	import type { Ingredient } from '$lib/server/types';

	const { ingredients, class: className } = $props<{
		ingredients: Ingredient[];
		class?: string;
	}>();
</script>

<div class={className}>
	<div class="flex flex-col gap-2">
		{#each ingredients as ingredient}
			<div class="flex flex-row items-center justify-between gap-6">
				<span class="grow text-sm font-medium">{ingredient.name}</span>
			</div>
		{/each}
	</div>
</div>
