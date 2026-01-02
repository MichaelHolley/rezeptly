<script lang="ts">
	import { addIngredient, getRecipeById, removeIngredient } from '$lib/api/recipes.remote';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sheet from '$lib/components/ui/sheet/';
	import type { Ingredient } from '$lib/server/types';
	import PenIcon from '@lucide/svelte/icons/pen';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	const { recipeId, ingredients }: { recipeId: number; ingredients: Ingredient[] } = $props();

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
								getRecipeById(recipeId).withOverride((recipe) => ({
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
			<div class="flex flex-col gap-2">
				{#each ingredients as ingr, i (ingr.id)}
					<div class="flex flex-row items-center justify-between gap-2">
						<span class="px-1 text-sm">{ingr.name}</span>
						<Button
							variant="secondary"
							type="button"
							size="sm"
							onclick={async () => {
								try {
									await removeIngredient({ recipeId, ingrId: ingr.id }).updates(
										getRecipeById(recipeId).withOverride((recipe) => ({
											...recipe,
											ingredients: recipe.ingredients.filter((i) => i.id !== ingr.id)
										}))
									);
								} catch (e) {
									console.error(e);
								}
							}}
						>
							<TrashIcon />
						</Button>
					</div>
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
