<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { AvailableTagsStore } from '$lib/store/available-tags.svelte';
	import type { TagCategory } from '$lib/server/types';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import * as InputGroup from '../ui/input-group';
	import TagComponent from './TagComponent.svelte';

	let {
		typeTag = $bindable(''),
		cuisineTag = $bindable(''),
		nutritionTag = $bindable(''),
		dietTag = $bindable('')
	}: {
		typeTag?: string;
		cuisineTag?: string;
		nutritionTag?: string;
		dietTag?: string;
	} = $props();

	const availableTags = $derived(AvailableTagsStore.tags);

	const CATEGORIES: { key: TagCategory; label: string }[] = [
		{ key: 'type', label: 'Type' },
		{ key: 'cuisine', label: 'Cuisine' },
		{ key: 'nutrition', label: 'Nutrition' },
		{ key: 'diet', label: 'Diet' }
	];

	let inputValues = $state<Record<TagCategory, string>>({
		type: '',
		cuisine: '',
		nutrition: '',
		diet: ''
	});

	function getCurrentValue(key: TagCategory): string {
		if (key === 'type') return typeTag;
		if (key === 'cuisine') return cuisineTag;
		if (key === 'nutrition') return nutritionTag;
		return dietTag;
	}

	function setCurrentValue(key: TagCategory, value: string) {
		if (key === 'type') typeTag = value;
		else if (key === 'cuisine') cuisineTag = value;
		else if (key === 'nutrition') nutritionTag = value;
		else dietTag = value;
	}

	function getSuggestions(key: TagCategory): string[] {
		const input = inputValues[key].trim().toLowerCase();
		if (!input) return [];
		const current = getCurrentValue(key);
		return availableTags
			.filter(
				(t) => t.category === key && t.name.toLowerCase().includes(input) && t.name !== current
			)
			.slice(0, 3)
			.map((t) => t.name);
	}

	function selectTag(key: TagCategory, name: string) {
		setCurrentValue(key, name);
		inputValues[key] = '';
	}

	function clearTag(key: TagCategory) {
		setCurrentValue(key, '');
	}

	function handleKeydown(key: TagCategory, e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			const input = inputValues[key].trim();
			if (input) selectTag(key, input);
		}
	}
</script>

<div class="flex flex-col gap-4">
	{#each CATEGORIES as { key, label } (key)}
		{@const currentValue = getCurrentValue(key)}
		{@const suggestions = getSuggestions(key)}
		<div class="form-group">
			<Label>{label}</Label>
			{#if currentValue}
				<div class="flex items-center">
					<TagComponent onSelect={() => clearTag(key)}>
						{currentValue}
						<XIcon />
					</TagComponent>
				</div>
			{:else}
				<InputGroup.Root>
					<InputGroup.Input
						type="text"
						placeholder="Enter a {label.toLowerCase()} tag and confirm with Enter"
						bind:value={inputValues[key]}
						onkeydown={(e) => handleKeydown(key, e)}
					/>
				</InputGroup.Root>
			{/if}
			{#if !currentValue && suggestions.length > 0}
				<div class="flex flex-row gap-2">
					<p class="text-neutral-500"><small>Suggestions:</small></p>
					{#each suggestions as tag (tag)}
						<TagComponent onSelect={() => selectTag(key, tag)}>
							{tag}
							<PlusIcon class="text-orange-500" />
						</TagComponent>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>
