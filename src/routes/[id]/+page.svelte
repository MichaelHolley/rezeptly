<script lang="ts">
	import IngredientsListComponent from '$lib/components/IngredientsListComponent.svelte';

	const { data } = $props();
</script>

<h2 class="mb-4">{data.recipe.name}</h2>

<div class="flex flex-row justify-between gap-12">
	<div>
		<div>
			<p class="text-lg font-light text-zinc-500">{data.recipe.description}</p>
		</div>

		<div class="my-4 block md:hidden">
			<h3 class="text-zinc-500">Ingredients</h3>
			<IngredientsListComponent ingredients={data.recipe.recipeIngredients} />
		</div>

		<div class="my-4">
			<h3 class="text-zinc-500">Instructions</h3>
		</div>
	</div>
	<div class="hidden md:block">
		<h4 class="text-zinc-500">Ingredients</h4>
		<IngredientsListComponent ingredients={data.recipe.recipeIngredients} />
	</div>
</div>
