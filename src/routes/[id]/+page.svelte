<script lang="ts">
	import IngredientsSheet from '$lib/components/IngredientsSheet.svelte';
	import IngredientsListComponent from '$lib/components/IngredientsListComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import PenIcon from '@lucide/svelte/icons/pen';

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

<p class="mt-1 text-xs text-zinc-400">Created: {data.recipe.createdAt?.toLocaleDateString()}</p>

<p class="my-4 text-base font-light text-zinc-500">{data.recipe.description}</p>

<div class="flex flex-row items-start justify-between gap-12">
	<div>
		<div class="block md:hidden">
			<div class="flex flex-row gap-1">
				<h3>Ingredients</h3>
				<IngredientsSheet recipeId={data.recipe.id} ingredients={data.recipe.ingredients}>
					<Button variant="ghost" slot="trigger"><PenIcon /></Button>
				</IngredientsSheet>
			</div>
			<IngredientsListComponent ingredients={data.recipe.ingredients} />
		</div>

		<div>
			<h3>Instructions</h3>
		</div>
	</div>
	<div class="hidden md:block">
		<div class="flex flex-row gap-1">
			<h3>Ingredients</h3>
			<IngredientsSheet recipeId={data.recipe.id} ingredients={data.recipe.ingredients}>
				<Button variant="ghost" slot="trigger"><PenIcon /></Button>
			</IngredientsSheet>
		</div>
		<IngredientsListComponent ingredients={data.recipe.ingredients} />
	</div>
</div>
