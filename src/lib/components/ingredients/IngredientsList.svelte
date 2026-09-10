<script lang="ts">
	import type { Ingredient } from '$lib/server/types';
	import type { IngredientSectionWithIngredients } from '$lib/server/types';
	import { groupIngredients } from '$lib/shared/ingredients';

	const {
		ingredients,
		ingredientSections,
		class: className
	}: {
		ingredients: Ingredient[];
		ingredientSections: IngredientSectionWithIngredients[];
		class?: string;
	} = $props();

	const groups = $derived(groupIngredients({ ingredients, ingredientSections }, false));
</script>

<div class={[className, 'flex max-w-sm flex-col gap-5']}>
	{#each groups as group, index (`${group.heading ?? 'ungrouped'}-${index}`)}
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
