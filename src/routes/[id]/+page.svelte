<script lang="ts">
	import IngredientsListComponent from '$lib/components/ingredients/IngredientsListComponent.svelte';
	import IngredientsSheet from '$lib/components/ingredients/IngredientsSheet.svelte';
	import DeleteRecipeConfirmationModal from '$lib/components/recipes/DeleteRecipeConfirmationModal.svelte';
	import { Button } from '$lib/components/ui/button';
	import PenIcon from '@lucide/svelte/icons/pen';

	const { data } = $props();
</script>

<div class="flex flex-row justify-between">
	<h2>{data.recipe.name}</h2>
	<DeleteRecipeConfirmationModal />
</div>

<p class="mt-1 text-xs text-zinc-400">
	Created: {data.recipe.createdAt?.toLocaleDateString(undefined, { dateStyle: 'long' })}
</p>

<p class="mt-4 mb-8 text-base font-light text-zinc-500">{data.recipe.description}</p>

<div class="flex flex-row items-start justify-between gap-12">
	<div>
		<div class="mb-8 block md:hidden">
			{@render ingredientsBlock()}
		</div>

		<div>
			<h3 class="pb-2">Instructions</h3>
		</div>
	</div>
	<div class="hidden md:block">
		{@render ingredientsBlock()}
	</div>
</div>

{#snippet ingredientsBlock()}
	<div class="flex flex-row gap-1 pb-2">
		<h3>Ingredients</h3>
		<IngredientsSheet ingredients={data.recipe.ingredients}>
			<Button variant="ghost" slot="trigger"><PenIcon /></Button>
		</IngredientsSheet>
	</div>
	<IngredientsListComponent ingredients={data.recipe.ingredients} />
{/snippet}
