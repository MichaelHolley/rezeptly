<script lang="ts">
	import IngredientsListComponent from '$lib/components/IngredientsListComponent.svelte';

	const { data } = $props();
</script>

<h2>{data.recipe.name}</h2>

<p class="my-4 text-lg font-light text-zinc-500">{data.recipe.description}</p>

<div class="flex flex-row justify-between gap-12">
	<div>
		<div class="my-4 block md:hidden">
			<h3>Ingredients</h3>
			<IngredientsListComponent ingredients={data.recipe.recipeIngredients} />
		</div>

		<div class="my-4">
			<h3>Instructions</h3>
		</div>
	</div>
	<div class="hidden md:block">
		<h3>Ingredients</h3>
		<IngredientsListComponent ingredients={data.recipe.recipeIngredients} />
	</div>
</div>
