<script lang="ts">
	import { createTag } from '$lib/api/tags.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { TagCategory } from '$lib/server/types';
	import { getErrorMessage } from '$lib/shared/error';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TagCategorySelectComponent from './TagCategorySelectComponent.svelte';

	let category = $state<TagCategory>('type');
	let errorMessage = $state<string | null>(null);
</script>

<form
	{...createTag.enhance(async ({ submit }) => {
		errorMessage = null;
		try {
			await submit();
		} catch (error) {
			errorMessage = getErrorMessage(error, 'Could not create the tag. Please try again.');
		}
	})}
	class="flex flex-col gap-2 rounded-md border border-zinc-200 p-4"
>
	<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
		<div class="form-group flex-1">
			<Label for="new-tag-name">Name</Label>
			<Input
				id="new-tag-name"
				placeholder="e.g. Pasta"
				required
				{...createTag.fields.name.as('text')}
			/>
		</div>
		<div class="form-group">
			<Label for="new-tag-category">Category</Label>
			<TagCategorySelectComponent
				id="new-tag-category"
				bind:value={category}
				class="w-full sm:w-40"
			/>
		</div>
		<Button type="submit" disabled={!!createTag.pending}>
			<PlusIcon />
			Create
		</Button>
	</div>
	<input {...createTag.fields.category.as('hidden', category)} />
	{#if errorMessage}
		<p class="text-destructive text-sm">{errorMessage}</p>
	{/if}
</form>
