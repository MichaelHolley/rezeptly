<script lang="ts">
	import TagComponent from '$lib/components/recipes/TagComponent.svelte';
	import type { Tag, TagCategory } from '$lib/server/types';
	import StarIcon from '@lucide/svelte/icons/star';
	import SearchBarComponent from './SearchBarComponent.svelte';

	const CATEGORIES: { id: TagCategory; label: string }[] = [
		{ id: 'type', label: 'Type' },
		{ id: 'cuisine', label: 'Cuisine' },
		{ id: 'diet', label: 'Diet' },
		{ id: 'nutrition', label: 'Nutrition' }
	];

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
		CATEGORIES.map(({ id, label }) => ({
			id,
			label,
			tags: availableTags.filter((t) => t.category === id)
		})).filter((c) => c.tags.length > 0)
	);

	const getSelected = (category: TagCategory): string[] => {
		if (category === 'type') return type;
		if (category === 'cuisine') return cuisine;
		if (category === 'nutrition') return nutrition;
		return diet;
	};

	const setSelected = (category: TagCategory, value: string[]) => {
		if (category === 'type') type = value;
		else if (category === 'cuisine') cuisine = value;
		else if (category === 'nutrition') nutrition = value;
		else diet = value;
	};

	const toggleTag = (category: TagCategory, slug: string) => {
		const current = getSelected(category);
		const updated = current.includes(slug)
			? current.filter((s) => s !== slug)
			: [...current, slug];
		setSelected(category, updated);
	};
</script>

<div class="my-4 flex flex-row justify-center">
	<div class="w-full max-w-xs">
		<div class="mb-3 flex flex-row items-center gap-2">
			<SearchBarComponent bind:searchTerm />
		</div>

		<div class="mb-3 flex flex-row flex-wrap gap-2">
			<TagComponent onSelect={() => (filterFavorites = !filterFavorites)} active={filterFavorites}>
				<StarIcon class="size-5 fill-yellow-400 text-yellow-400" />
			</TagComponent>
		</div>

		{#each tagsByCategory as { id, label, tags }}
			<div class="mb-3">
				<p class="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
					{label}
				</p>
				<div class="flex flex-row flex-wrap gap-2">
					{#each tags as tag (tag.slug)}
						<TagComponent
							onSelect={() => toggleTag(id, tag.slug)}
							active={getSelected(id).includes(tag.slug)}
						>
							{tag.name}
						</TagComponent>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
