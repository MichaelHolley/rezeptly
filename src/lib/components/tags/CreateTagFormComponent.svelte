<script lang="ts">
	import { createTag } from '$lib/api/tags.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { TagCategory } from '$lib/server/types';
	import { cn } from '$lib/utils';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TagCategorySelectComponent from './TagCategorySelectComponent.svelte';

	const { class: className }: { class?: string } = $props();

	let category = $state<TagCategory>('type');
</script>

<form
	{...createTag.enhance(async ({ submit }) => {
		try {
			await submit();
		} catch (error) {
			console.error(error);
		}
	})}
	class={cn('flex flex-col gap-2 rounded-md border border-zinc-200 p-4', className)}
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
</form>
