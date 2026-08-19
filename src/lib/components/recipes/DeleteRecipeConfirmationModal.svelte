<script lang="ts">
	import { deleteRecipe } from '$lib/api/recipes.remote';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toAppError } from '$lib/shared/error';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';

	const {
		recipeId
	}: {
		recipeId: number;
	} = $props();

	let errorMessage = $state<string | null>(null);
</script>

<Dialog.Root onOpenChange={() => (errorMessage = null)}>
	<Dialog.Trigger class={buttonVariants({ variant: 'destructive' })} title="Delete Recipe">
		<TrashIcon />
	</Dialog.Trigger>
	<Dialog.Content>
		<form
			{...deleteRecipe.enhance(async ({ submit }) => {
				errorMessage = null;
				try {
					await submit();
				} catch (error) {
					errorMessage = toAppError(error).message;
				}
			})}
		>
			<input {...deleteRecipe.fields.recipeId.as('hidden', recipeId)} />
			<Dialog.Header>
				<Dialog.Title>Are you sure you want to delete this recipe?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently delete your recipe.
				</Dialog.Description>
			</Dialog.Header>
			{#if errorMessage}
				<p role="alert" class="text-destructive mt-4 text-sm">{errorMessage}</p>
			{/if}
			<Dialog.Footer>
				<div class="mt-4 flex flex-row justify-between gap-2 sm:justify-end">
					<Dialog.Close
						type="button"
						class={buttonVariants({ variant: 'secondary' })}
						disabled={!!deleteRecipe.pending}
					>
						<XIcon />
						Cancel
					</Dialog.Close>
					<Button variant="destructive" type="submit" disabled={!!deleteRecipe.pending}>
						<TrashIcon />
						Delete
					</Button>
				</div>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
