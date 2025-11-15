<script lang="ts">
	import { deleteRecipe } from '$lib/api/recipes.remote';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';

	const {
		trigger,
		recipeId
	}: {
		trigger: Snippet;
		recipeId: number;
	} = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#if trigger}
			{@render trigger()}
		{/if}
	</Dialog.Trigger>
	<Dialog.Content>
		<form {...deleteRecipe}>
			<input {...deleteRecipe.fields.recipeId.as('hidden', String(recipeId))} />
			<Dialog.Header>
				<Dialog.Title>Are you sure you want to delete this recipe?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently delete your recipe.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<div class="mt-2 flex flex-row justify-between gap-2 sm:justify-end">
					<Dialog.Close>
						<Button variant="secondary" disabled={!!deleteRecipe.pending}>
							<XIcon />
							Cancel
						</Button>
					</Dialog.Close>
					<Button
						class="btn btn-error"
						variant="destructive"
						type="submit"
						disabled={!!deleteRecipe.pending}
					>
						<TrashIcon />
						Delete
					</Button>
				</div>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
