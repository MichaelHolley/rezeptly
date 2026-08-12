<script lang="ts">
	import { deleteTag } from '$lib/api/tags.remote';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';

	const {
		tagId,
		tagName,
		recipeCount
	}: {
		tagId: number;
		tagName: string;
		recipeCount: number;
	} = $props();

	const deleteForm = $derived(deleteTag.for(tagId));

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={buttonVariants({ variant: 'ghost', size: 'icon' })}
		title="Delete {tagName}"
	>
		<TrashIcon class="text-destructive" />
	</Dialog.Trigger>
	<Dialog.Content>
		<form
			{...deleteForm.enhance(async ({ submit }) => {
				try {
					await submit();
					open = false;
				} catch (error) {
					console.error(error);
				}
			})}
		>
			<input {...deleteForm.fields.tagId.as('hidden', tagId)} />
			<Dialog.Header>
				<Dialog.Title>Delete “{tagName}”?</Dialog.Title>
				<Dialog.Description>
					{#if recipeCount > 0}
						This tag is used by {recipeCount}
						{recipeCount === 1 ? 'recipe' : 'recipes'}. Deleting it removes the tag from those
						recipes. This action cannot be undone.
					{:else}
						This tag is not used by any recipe. This action cannot be undone.
					{/if}
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<div class="mt-4 flex flex-row justify-between gap-2 sm:justify-end">
					<Dialog.Close>
						<Button variant="secondary" disabled={!!deleteForm.pending}>
							<XIcon />
							Cancel
						</Button>
					</Dialog.Close>
					<Button variant="destructive" type="submit" disabled={!!deleteForm.pending}>
						<TrashIcon />
						Delete
					</Button>
				</div>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
