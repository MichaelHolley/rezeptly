<script lang="ts">
	import { updateTag } from '$lib/api/tags.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { TagWithUsage } from '$lib/server/services/tag.service';
	import type { TagCategory } from '$lib/server/types';
	import { getErrorMessage } from '$lib/shared/error';
	import CheckIcon from '@lucide/svelte/icons/check';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import XIcon from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import DeleteTagConfirmationModal from './DeleteTagConfirmationModal.svelte';
	import TagCategorySelectComponent from './TagCategorySelectComponent.svelte';

	const { tag }: { tag: TagWithUsage } = $props();

	const editForm = $derived(updateTag.for(tag.id));

	let editing = $state(false);
	let category = $state<TagCategory>(untrack(() => tag.category));
	let errorMessage = $state<string | null>(null);

	const stopEditing = () => {
		editing = false;
		category = tag.category;
		errorMessage = null;
	};
</script>

<li class="flex flex-col gap-1 border-b border-zinc-100 py-2 last:border-b-0">
	{#if editing}
		<form
			{...editForm.enhance(async ({ submit }) => {
				errorMessage = null;
				try {
					await submit();
					editing = false;
				} catch (error) {
					errorMessage = getErrorMessage(error, 'Could not save the tag. Please try again.');
				}
			})}
			class="flex flex-row flex-wrap items-center gap-2"
		>
			<input {...editForm.fields.tagId.as('hidden', tag.id)} />
			<input {...editForm.fields.category.as('hidden', category)} />
			<Input
				{...editForm.fields.name.as('text')}
				value={tag.name}
				required
				aria-label="Tag name"
				class="w-auto flex-1"
			/>
			<TagCategorySelectComponent bind:value={category} aria-label="Tag category" class="w-36" />
			<Button type="submit" size="icon" title="Save" disabled={!!editForm.pending}>
				<CheckIcon />
			</Button>
			<Button
				type="button"
				variant="secondary"
				size="icon"
				title="Cancel"
				onclick={stopEditing}
				disabled={!!editForm.pending}
			>
				<XIcon />
			</Button>
		</form>
	{:else}
		<div class="flex flex-row items-center gap-2">
			<span class="flex-1 text-sm">{tag.name}</span>
			<span class="text-xs text-zinc-500">
				{tag.recipeCount}
				{tag.recipeCount === 1 ? 'recipe' : 'recipes'}
			</span>
			<Button variant="ghost" size="icon" title="Edit {tag.name}" onclick={() => (editing = true)}>
				<PencilIcon />
			</Button>
			<DeleteTagConfirmationModal tagId={tag.id} tagName={tag.name} recipeCount={tag.recipeCount} />
		</div>
	{/if}
	{#if errorMessage}
		<p class="text-destructive text-sm">{errorMessage}</p>
	{/if}
</li>
