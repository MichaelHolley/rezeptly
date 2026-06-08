<script lang="ts">
	import type { Ingredient } from '$lib/server/types';
	import UsersIcon from '@lucide/svelte/icons/users';

	const {
		ingredients,
		portions,
		class: className
	}: {
		ingredients: Ingredient[];
		portions?: number | null;
		class?: string;
	} = $props();
</script>

<div class={className}>
	{#if portions != null}
		<p class="flex items-center gap-1.5 pb-2 text-sm text-zinc-500" title="Portions">
			<UsersIcon class="h-4 w-4" />{portions}
		</p>
	{/if}
	<ul class="max-w-sm space-y-2">
		{#each ingredients as ingredient (ingredient.id)}
			<li class="flex flex-row items-center justify-between gap-6">
				<span class="grow text-sm text-wrap">{ingredient.name}</span>
			</li>
		{/each}
	</ul>
</div>
