<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import MultiSelectComponent from '$lib/components/ui/multi-select/MultiSelectComponent.svelte';
	import type { Tag, TagCategory } from '$lib/server/types';
	import { TAG_CATEGORY_CONFIG } from '$lib/shared/tags';
	import { cn } from '$lib/utils';
	import StarIcon from '@lucide/svelte/icons/star';
	import SearchBarComponent from './SearchBarComponent.svelte';

	let {
		searchTerm = $bindable(),
		filterFavorites = $bindable(),
		type = $bindable(),
		cuisine = $bindable(),
		nutrition = $bindable(),
		diet = $bindable(),
		availableTags
	}: {
		searchTerm: string;
		filterFavorites: boolean;
		type: string[];
		cuisine: string[];
		nutrition: string[];
		diet: string[];
		availableTags: Tag[];
	} = $props();

	const tagsByCategory = $derived(
		TAG_CATEGORY_CONFIG.map(({ key, label }) => ({
			key,
			label,
			tags: availableTags.filter((t) => t.category === key)
		})).filter((c) => c.tags.length > 0)
	);

	const getSelected = (category: TagCategory): string[] =>
		({ type, cuisine, nutrition, diet })[category];

	const setters: Record<TagCategory, (v: string[]) => void> = {
		type: (v) => (type = v),
		cuisine: (v) => (cuisine = v),
		nutrition: (v) => (nutrition = v),
		diet: (v) => (diet = v)
	};
</script>

<div class="my-4">
	<div class="mb-3 mx-auto max-w-xs">
		<SearchBarComponent bind:searchTerm />
	</div>

	<div class="flex flex-row flex-wrap items-center gap-2 justify-center">
		<Button
			variant="outline"
			size="sm"
			onclick={() => (filterFavorites = !filterFavorites)}
			class={cn(
				'rounded-full',
				filterFavorites &&
					'border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
			)}
		>
			<StarIcon
				class={cn(
					'size-4',
					filterFavorites ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
				)}
			/>
			Favorites
		</Button>
		{#each tagsByCategory as { key, label, tags } (key)}
			<MultiSelectComponent
				{label}
				options={tags.map((t) => ({ value: t.slug, label: t.name }))}
				selected={getSelected(key)}
				onchange={setters[key]}
			/>
		{/each}
	</div>
</div>
