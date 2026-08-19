<script lang="ts">
	import { createTag } from '$lib/api/tags.remote';
	import FieldIssues from '$lib/components/common/FieldIssues.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { TagCategory } from '$lib/server/types';
	import { toAppError } from '$lib/shared/error';
	import { cn } from '$lib/utils';
	import PlusIcon from '@lucide/svelte/icons/plus';

	const { category, class: className }: { category: TagCategory; class?: string } = $props();

	const form = $derived(createTag.for(category));

	let errorMessage = $state<string | null>(null);
</script>

<form
	{...form.enhance(async ({ submit, element }) => {
		errorMessage = null;
		try {
			if (await submit()) {
				element.reset();
			}
		} catch (error) {
			errorMessage = toAppError(error).message;
		}
	})}
	class={cn('flex flex-row items-start gap-2', className)}
>
	<div class="form-group flex-1">
		<Input
			placeholder="e.g. Pasta"
			required
			aria-label="Tag name"
			{...form.fields.name.as('text')}
		/>
		<FieldIssues issues={form.fields.name.issues()} />
	</div>
	<input {...form.fields.category.as('hidden', category)} />
	<Button type="submit" size="icon" title="Add tag" disabled={!!form.pending}>
		<PlusIcon />
	</Button>
	{#if errorMessage}
		<p role="alert" class="text-destructive w-full text-sm">{errorMessage}</p>
	{/if}
</form>
