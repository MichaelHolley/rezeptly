<script lang="ts">
	import IngredientsListComponent from '$lib/components/IngredientsListComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	const { data } = $props();
</script>

<div class="flex flex-row justify-between">
	<h2>{data.recipe.name}</h2>
	<form method="POST" action="?/delete">
		<Button class="btn btn-error" variant="destructive" type="submit">
			<TrashIcon />
			Delete
		</Button>
	</form>
</div>

<p class="my-4 text-base font-light text-zinc-500">{data.recipe.description}</p>

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
