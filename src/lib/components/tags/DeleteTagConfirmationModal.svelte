<script lang="ts">
	import { deleteTag } from '$lib/api/tags.remote';
	import SingleSelectComponent from '$lib/components/common/SingleSelectComponent.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toAppError } from '$lib/shared/error';
	import { getTagCategoryLabel } from '$lib/shared/tags';
	import { AvailableTagsStore } from '$lib/store/available-tags.svelte';
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
	let targetTagId = $state<number | null>(null);
	let errorMessage = $state<string | null>(null);

	const targetTags = $derived(AvailableTagsStore.tags.filter((t) => t.id !== tagId));
	const canMigrate = $derived(recipeCount > 0 && targetTags.length > 0);
	const targetOptions = $derived(
		targetTags.map((t) => ({
			value: t.id,
			label: `${t.name} (${getTagCategoryLabel(t.category)})`
		}))
	);
	const selectedTarget = $derived(targetTags.find((t) => t.id === targetTagId) ?? null);
	const recipeLabel = $derived(recipeCount === 1 ? 'recipe' : 'recipes');

	const resetState = () => {
		targetTagId = null;
		errorMessage = null;
	};
</script>

<Dialog.Root bind:open onOpenChange={resetState}>
	<Dialog.Trigger
		class={buttonVariants({ variant: 'ghost', size: 'icon' })}
		title="Delete {tagName}"
	>
		<TrashIcon class="text-destructive" />
	</Dialog.Trigger>
	<Dialog.Content>
		<form
			{...deleteForm.enhance(async ({ submit }) => {
				errorMessage = null;
				try {
					if (await submit()) {
						open = false;
					}
				} catch (error) {
					errorMessage = toAppError(error).message;
				}
			})}
		>
			<input {...deleteForm.fields.tagId.as('hidden', tagId)} />
			{#if selectedTarget}
				<input {...deleteForm.fields.targetTagId.as('hidden', selectedTarget.id)} />
			{/if}
			<Dialog.Header>
				<Dialog.Title>Delete "{tagName}"?</Dialog.Title>
				<Dialog.Description>
					{#if selectedTarget}
						The {recipeCount}
						{recipeLabel} will be moved to "{selectedTarget.name}" ({getTagCategoryLabel(
							selectedTarget.category
						)}) before this tag is deleted. This action cannot be undone.
					{:else if recipeCount > 0}
						This tag is used by {recipeCount}
						{recipeLabel}. Deleting it removes the tag from those recipes. This action cannot be
						undone.
					{:else}
						This tag is not used by any recipe. This action cannot be undone.
					{/if}
				</Dialog.Description>
			</Dialog.Header>
			{#if canMigrate}
				<div class="mt-4 flex flex-row items-center gap-2">
					<span class="text-sm">Move recipes to</span>
					<SingleSelectComponent
						label="Move recipes to"
						options={targetOptions}
						value={targetTagId}
						onchange={(v) => (targetTagId = v)}
						hideLabel
					/>
				</div>
			{/if}
			{#if errorMessage}
				<p role="alert" class="text-destructive mt-4 text-sm">{errorMessage}</p>
			{/if}
			<Dialog.Footer>
				<div class="mt-4 flex flex-row justify-between gap-2 sm:justify-end">
					<Dialog.Close
						type="button"
						class={buttonVariants({ variant: 'secondary' })}
						disabled={!!deleteForm.pending}
					>
						<XIcon />
						Cancel
					</Dialog.Close>
					<Button variant="destructive" type="submit" disabled={!!deleteForm.pending}>
						<TrashIcon />
						{selectedTarget ? 'Move & Delete' : 'Delete'}
					</Button>
				</div>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
