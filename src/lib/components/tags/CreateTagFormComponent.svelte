<script lang="ts">
	import { createTag } from '$lib/api/tags.remote';
	import SingleSelectComponent from '$lib/components/common/SingleSelectComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { TagCategory } from '$lib/server/types';
	import { toAppError } from '$lib/shared/error';
	import { TAG_CATEGORY_SELECT_OPTIONS } from '$lib/shared/tags';
	import { cn } from '$lib/utils';
	import PlusIcon from '@lucide/svelte/icons/plus';

	const { class: className }: { class?: string } = $props();

	let category = $state<TagCategory>('type');
	let errorMessage = $state<string | null>(null);
</script>

<form
	{...createTag.enhance(async (form) => {
		errorMessage = null;
		try {
			await form.submit();
			form.element.reset();
		} catch (error) {
			errorMessage = toAppError(error).message;
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
		<SingleSelectComponent
			label="Category"
			options={TAG_CATEGORY_SELECT_OPTIONS}
			value={category}
			onchange={(v) => (category = v ?? category)}
			clearable={false}
			hideLabel
		/>
		<Button type="submit" disabled={!!createTag.pending}>
			<PlusIcon />
			Create
		</Button>
	</div>
	<input {...createTag.fields.category.as('hidden', category)} />
	{#if errorMessage}
		<p role="alert" class="text-destructive text-sm">{errorMessage}</p>
	{/if}
</form>
