<script lang="ts">
	import type { Ingredient, RecipeIngredient } from '$lib/server/types';

	const { ingredients, class: className } = $props<{
		ingredients: RecipeIngredient[];
		class?: string;
	}>();
</script>

<div class={className}>
	<div class="flex flex-col gap-2">
		{#each ingredients as ingredient}
			<div class="flex flex-row items-center justify-between">
				<span class="text-sm font-medium">{ingredient.name}</span>
				<span class="text-xs text-zinc-500">{ingredient.quantity} {ingredient.unit}</span>
			</div>
		{/each}
	</div>
</div>
