<script lang="ts">
	import IngredientsListComponent from '$lib/components/IngredientsListComponent.svelte';
	import { ingredients } from '$lib/server/db/schema.js';

	const { data } = $props();
</script>

<h2>{data.recipe.name}</h2>

<div class="flex flex-row justify-between gap-6">
	<div>
		<div>
			<p class="text-lg font-light text-zinc-500">{data.recipe.description}</p>
		</div>

		<div class="my-4 block md:hidden">
			<h3>Ingredients</h3>
			<IngredientsListComponent ingredients={data.recipe.ingredients} />
		</div>

		<div class="my-4">
			<h3>Instructions</h3>
		</div>
	</div>
	<div class="hidden md:block"></div>
</div>
