<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sheet from '$lib/components/ui/sheet/';
	import type { Ingredient, NewIngredient } from '$lib/server/types';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	const { ingredients, recipeId } = $props<{
		ingredients: Ingredient[];
		recipeId: number;
	}>();

	const newIngredients = $state<NewIngredient[]>(ingredients);
</script>

<Sheet.Root>
	<Sheet.Trigger>
		<slot name="trigger"></slot>
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Edit Ingredients</Sheet.Title>
			<Sheet.Description>Make changes to the ingredients for this recipe.</Sheet.Description>
		</Sheet.Header>

		<form method="POST" action="?/updateIngredients">
			<div class="px-4">
				<div class="flex flex-col gap-2 py-4">
					{#each newIngredients as ingr, i}
						<div class="flex flex-row items-center justify-between gap-2">
							<Input value={ingr.name} type="text" required class="grow" />
							<Button variant="destructive"><TrashIcon /></Button>
						</div>
						{#if i !== newIngredients.length - 1}
							<Separator />
						{/if}
					{/each}
				</div>
				<!-- <div class="flex flex-row gap-1">
					<Input type="text" bind:value={newIngredientInputValue} required />
					<Button type="button" onclick={addNewIngredient}>+</Button>
				</div> -->
			</div>
			<Sheet.Footer>
				<Sheet.Close>
					<Button type="submit">Save changes</Button>
				</Sheet.Close>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
