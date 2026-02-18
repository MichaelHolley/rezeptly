<script lang="ts">
	import { addIngredient, getRecipeBySlug } from '$lib/api/recipes.remote';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sheet from '$lib/components/ui/sheet/';
	import type { Ingredient } from '$lib/server/types';
	import PenIcon from '@lucide/svelte/icons/pen';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import IngredientItem from './IngredientItem.svelte';

	const {
		recipeId,
		recipeSlug,
		ingredients
	}: { recipeId: number; recipeSlug: string; ingredients: Ingredient[] } = $props();

	let inputRef = $state<HTMLInputElement | null>(null);
</script>

<Sheet.Root>
	<Sheet.Trigger class={buttonVariants({ variant: 'ghost' })} title="Edit Ingredients">
		<PenIcon />
	</Sheet.Trigger>
	<Sheet.Content class="max-h-svh">
		<Sheet.Header>
			<Sheet.Title>Edit Ingredients</Sheet.Title>
			<Sheet.Description>Make changes to the ingredients for this recipe.</Sheet.Description>
			<form
				{...addIngredient.enhance(async ({ form, data, submit }) => {
					try {
						await submit()
							.updates(
								getRecipeBySlug(recipeSlug).withOverride((recipe) => ({
									...recipe,
									ingredients: [...recipe.ingredients, { name: data.name, id: 0, recipeId }]
								}))
							)
							.then(() => {
								form.reset();
								setTimeout(() => inputRef?.focus(), 50);
							});
					} catch (error) {
						console.error(error);
					}
				})}
				class="mt-6 flex flex-row gap-2"
			>
				<input {...addIngredient.fields.recipeId.as('hidden', recipeId)} />
				<Input
					required
					{...addIngredient.fields.name.as('text')}
					placeholder="Ingredient & Quantity"
					disabled={!!addIngredient.pending}
					bind:ref={inputRef}
				/>
				<Button type="submit" disabled={!!addIngredient.pending}><PlusIcon /></Button>
			</form>
		</Sheet.Header>

		<div class="h-full overflow-y-auto px-4">
			<div class="flex flex-col gap-2 py-1">
				{#each ingredients as ingr, i (ingr.id)}
					<IngredientItem ingredient={ingr} {recipeId} {recipeSlug} />
					{#if i !== ingredients.length - 1}
						<Separator />
					{/if}
				{/each}
			</div>
		</div>
		<Sheet.Footer>
			<Sheet.Close>
				<Button type="button">Close</Button>
			</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
