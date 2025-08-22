<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sheet from '$lib/components/ui/sheet/';
	import type { Ingredient } from '$lib/server/types';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import { addIngredient, removeIngredient } from '../../../routes/(app)/[id]/page.remote';

	const { recipeId, ingredients } = $props<{ recipeId: number; ingredients: Ingredient[] }>();
</script>

<Sheet.Root>
	<Sheet.Trigger>
		<slot name="trigger"></slot>
	</Sheet.Trigger>
	<Sheet.Content class="max-h-svh">
		<Sheet.Header>
			<Sheet.Title>Edit Ingredients</Sheet.Title>
			<Sheet.Description>Make changes to the ingredients for this recipe.</Sheet.Description>
			<form {...addIngredient} class="mt-6 flex flex-row gap-2">
				<Input type="hidden" name="recipeId" value={recipeId} />
				<Input type="text" name="name" required placeholder="Ingredient & Quantity" />
				<Button type="submit"><PlusIcon /></Button>
			</form>
		</Sheet.Header>

		<div class="h-full overflow-y-auto px-4">
			<div class="flex flex-col gap-2">
				{#each ingredients as ingr, i}
					<div class="flex flex-row items-center justify-between gap-2">
						<span class="px-1 text-sm">{ingr.name}</span>
						<Button
							variant="secondary"
							type="submit"
							size="sm"
							onclick={async () => {
								try {
									await removeIngredient({ recipeId, ingrId: ingr.id });
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
