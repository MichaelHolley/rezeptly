<script lang="ts">
	import { nonEmptyGroups, type IngredientGroup } from '#lib/shared/ingredients.js';

	const { groups, class: className }: { groups: IngredientGroup[]; class?: string } = $props();

	const visibleGroups = $derived(nonEmptyGroups(groups));
</script>

<div class={[className, 'flex max-w-sm flex-col gap-5']}>
	{#each visibleGroups as group (group.id ?? 'ungrouped')}
		<section class="flex flex-col gap-3">
			{#if group.heading}<h4 class="font-semibold">{group.heading}</h4>{/if}
			<ul class="flex flex-col gap-3">
				{#each group.items as ingredient (ingredient.id)}
					<li class="flex flex-row items-center justify-between gap-6">
						<span class="grow text-sm leading-snug text-wrap text-zinc-700">{ingredient.name}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
