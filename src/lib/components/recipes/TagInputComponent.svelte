<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { AvailableTagsStore } from '$lib/store/available-tags.svelte';
	import type { TagCategory } from '$lib/server/types';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import * as InputGroup from '../ui/input-group';
	import TagComponent from './TagComponent.svelte';

	let {
		tags = $bindable(),
		label = 'Tags',
		placeholder = 'Enter a tag-name and confirm with Enter-Key',
		category,
		inputId = 'tagsinput'
	}: {
		tags: string[];
		label?: string;
		placeholder?: string;
		category?: TagCategory;
		inputId?: string;
	} = $props();

	let tagInputValue = $state('');
	const availableTags = $derived(AvailableTagsStore.tags);

	const normalizeTag = (value: string) => value.trim().toLowerCase();

	const recommendedTags = $derived.by(() => {
		const input = normalizeTag(tagInputValue);
		const selectedTags = new Set(tags.map((tag) => normalizeTag(tag)));

		return availableTags
			.filter(
				(tag) =>
					(!category || tag.category === category) &&
					!selectedTags.has(normalizeTag(tag.name)) &&
					(!input || normalizeTag(tag.name).includes(input))
			)
			.slice(0, 3)
			.map((tag) => tag.name);
	});

	function addTag(tagValue: string) {
		const trimmedValue = tagValue.trim();

		if (!trimmedValue) {
			return;
		}

		if (tags.some((tag) => normalizeTag(tag) === normalizeTag(trimmedValue))) {
			tagInputValue = '';
			return;
		}

		tags = [...tags, trimmedValue];
		tagInputValue = '';
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag(tagInputValue);
		}
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}
</script>

<div class="form-group">
	<Label for={inputId}>{label}</Label>

	<InputGroup.Root class="h-fit!">
		<InputGroup.Input
			id={inputId}
			type="text"
			{placeholder}
			bind:value={tagInputValue}
			onkeydown={handleInputKeydown}
		/>
		{#if tags.length > 0}
			<InputGroup.Addon align="inline-start">
				<div class="flex flex-row flex-wrap gap-2">
					{#each tags as tag (tag)}
						<TagComponent onSelect={() => removeTag(tag)}>
							{tag}
							<XIcon />
						</TagComponent>
					{/each}
				</div>
			</InputGroup.Addon>
		{/if}
	</InputGroup.Root>
	<div class="flex flex-row gap-2">
		<p class="text-neutral-500"><small>Suggestions:</small></p>
		{#each recommendedTags as tag (tag)}
			<TagComponent onSelect={() => addTag(tag)}>
				{tag}
				<PlusIcon class="text-orange-500" />
			</TagComponent>
		{/each}
	</div>
</div>
