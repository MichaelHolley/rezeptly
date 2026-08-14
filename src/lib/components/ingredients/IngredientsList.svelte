<script lang="ts">
	import type { Ingredient } from '$lib/server/types';

	const {
		ingredients,
		class: className
	}: {
		ingredients: Ingredient[];
		class?: string;
	} = $props();
</script>

<div class={className}>
	<ul class="max-w-sm space-y-3">
		{#each ingredients as ingredient (ingredient.id)}
			<li class="flex flex-row items-center justify-between gap-6">
				<span class="grow text-sm leading-snug text-wrap text-zinc-700">{ingredient.name}</span>
			</li>
		{/each}
	</ul>
</div>
