<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { AvailableTagsStore } from '$lib/store/available-tags.svelte';
	import type { TagCategory } from '$lib/server/types';
	import { TAG_CATEGORY_CONFIG } from '$lib/shared/tags';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import * as InputGroup from '../ui/input-group';
	import TagComponent from './TagComponent.svelte';

	let {
		typeTags = $bindable([]),
		cuisineTags = $bindable([]),
		nutritionTags = $bindable([]),
		dietTags = $bindable([])
	}: {
		typeTags?: string[];
		cuisineTags?: string[];
		nutritionTags?: string[];
		dietTags?: string[];
	} = $props();

	const MAX_SUGGESTIONS = 3;

	const availableTags = $derived(AvailableTagsStore.tags);

	const PLACEHOLDERS: Record<TagCategory, string> = {
		type: 'e.g. Cake, Dessert, Pasta, Salad, Sauce …',
		cuisine: 'e.g. Italian, French, Mexican, German …',
		diet: 'e.g. Vegan, Chicken …',
		nutrition: 'e.g. High protein, Low carb …'
	};

	let inputValues = $state<Record<TagCategory, string>>({
		type: '',
		cuisine: '',
		nutrition: '',
		diet: ''
	});

	const getters: Record<TagCategory, () => string[]> = {
		type: () => typeTags,
		cuisine: () => cuisineTags,
		nutrition: () => nutritionTags,
		diet: () => dietTags
	};

	const setters: Record<TagCategory, (v: string[]) => void> = {
		type: (v) => (typeTags = v),
		cuisine: (v) => (cuisineTags = v),
		nutrition: (v) => (nutritionTags = v),
		diet: (v) => (dietTags = v)
	};

	const getCurrentValues = (key: TagCategory): string[] => getters[key]();

	function addTag(key: TagCategory, name: string) {
		const trimmed = name.trim();
		if (!trimmed) return;
		const current = getCurrentValues(key);
		if (!current.includes(trimmed)) setters[key]([...current, trimmed]);
		inputValues[key] = '';
	}

	function removeTag(key: TagCategory, name: string) {
		setters[key](getCurrentValues(key).filter((t) => t !== name));
	}

	function getSuggestions(key: TagCategory): string[] {
		const input = inputValues[key].trim().toLowerCase();
		const current = getCurrentValues(key);
		return availableTags
			.filter(
				(t) =>
					t.category === key &&
					!current.includes(t.name) &&
					(!input || t.name.toLowerCase().includes(input))
			)
			.slice(0, MAX_SUGGESTIONS)
			.map((t) => t.name);
	}

	function handleKeydown(key: TagCategory, e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			const input = inputValues[key].trim();
			if (input) addTag(key, input);
		}
	}
</script>

<div class="flex flex-col gap-4">
	{#each TAG_CATEGORY_CONFIG as { key, label } (key)}
		{@const currentValues = getCurrentValues(key)}
		{@const suggestions = getSuggestions(key)}
		<div class="form-group">
			<Label>{label}</Label>
			{#if currentValues.length > 0}
				<div class="mb-2 flex flex-wrap gap-1">
					{#each currentValues as tag (tag)}
						<TagComponent onSelect={() => removeTag(key, tag)}>
							{tag}
							<XIcon />
						</TagComponent>
					{/each}
				</div>
			{/if}
			<InputGroup.Root>
				<InputGroup.Input
					type="text"
					placeholder={PLACEHOLDERS[key]}
					bind:value={inputValues[key]}
					onkeydown={(e) => handleKeydown(key, e)}
				/>
			</InputGroup.Root>
			{#if suggestions.length > 0}
				<div class="flex flex-row gap-2">
					<p class="text-neutral-500"><small>Suggestions:</small></p>
					{#each suggestions as tag (tag)}
						<TagComponent onSelect={() => addTag(key, tag)}>
							{tag}
							<PlusIcon class="text-orange-500" />
						</TagComponent>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>
