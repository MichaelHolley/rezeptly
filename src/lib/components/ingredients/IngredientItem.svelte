<script lang="ts">
	import { getRecipeById, removeIngredient } from '$lib/api/recipes.remote';
	import { Button } from '$lib/components/ui/button';
	import type { Ingredient } from '$lib/server/types';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	const { ingredient, recipeId }: { ingredient: Ingredient; recipeId: number } = $props();
</script>

<div class="flex flex-row items-center justify-between gap-2">
	<span class="px-1 text-sm">{ingredient.name}</span>
	<Button
		variant="secondary"
		type="button"
		size="sm"
		onclick={async () => {
			try {
				await removeIngredient({ recipeId, ingrId: ingredient.id }).updates(
					getRecipeById(recipeId).withOverride((recipe) => ({
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
</div>
