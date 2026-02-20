<script lang="ts">
	import { editIngredient, getRecipeBySlug, removeIngredient } from '$lib/api/recipes.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { Ingredient } from '$lib/server/types';
	import CheckIcon from '@lucide/svelte/icons/check';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';

	const {
		ingredient,
		recipeId,
		recipeSlug
	}: { ingredient: Ingredient; recipeId: number; recipeSlug: string } = $props();

	let isEditing = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);
	let editValue = $state('');

	function editItem() {
		isEditing = true;
		editValue = ingredient.name;
		setTimeout(() => inputRef?.focus(), 50);
	}

	function cancelEdit() {
		isEditing = false;
	}
</script>

<div class="flex flex-row items-center justify-between gap-2">
	{#if isEditing}
		<form
			{...editIngredient.enhance(async ({ submit }) => {
				try {
					await submit()
						.updates(
							getRecipeBySlug(recipeSlug).withOverride((recipe) => ({
								...recipe,
								ingredients: recipe.ingredients.map((i) =>
									i.id === ingredient.id ? { ...i, name: editValue } : i
								)
							}))
						)
						.then(() => {
							isEditing = false;
						});
				} catch (error) {
					console.error(error);
				}
			})}
			class="flex flex-1 flex-row items-center gap-2"
		>
			<input {...editIngredient.fields.recipeId.as('hidden', recipeId)} />
			<input {...editIngredient.fields.ingrId.as('hidden', ingredient.id)} />
			<Input
				required
				{...editIngredient.fields.name.as('text')}
				bind:value={editValue}
				bind:ref={inputRef}
				disabled={!!editIngredient.pending}
				class="text-sm"
				onkeydown={(e) => {
					e.stopPropagation();
					if (e.key === 'Escape') {
						cancelEdit();
					}
				}}
			/>
			<Button
				type="submit"
				variant="ghost"
				size="sm"
				disabled={!!editIngredient.pending}
				title="Save ingredient"
			>
				<CheckIcon />
			</Button>
			<Button type="button" variant="ghost" size="sm" onclick={cancelEdit} title="Cancel edit">
				<XIcon />
			</Button>
		</form>
	{:else}
		<button
			class="flex-1 cursor-pointer px-1 text-left text-sm"
			onclick={editItem}
			title="Edit ingredient"
		>
			{ingredient.name}
		</button>
		<Button
			variant="secondary"
			type="button"
			size="sm"
			title="Delete ingredient"
			onclick={async () => {
				try {
					await removeIngredient({ recipeId, ingrId: ingredient.id }).updates(
						getRecipeBySlug(recipeSlug).withOverride((recipe) => ({
							...recipe,
							ingredients: recipe.ingredients.filter((i) => i.id !== ingredient.id)
						}))
					);
				} catch (e) {
					console.error(e);
				}
			}}
		>
			<TrashIcon />
		</Button>
	{/if}
</div>
