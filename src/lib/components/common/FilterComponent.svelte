<script lang="ts">
	import TagComponent from '$lib/components/recipes/TagComponent.svelte';
	import type { Tag, TagCategory } from '$lib/server/types';
	import { TAG_CATEGORY_CONFIG } from '$lib/shared/tags';
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

	const toggleTag = (category: TagCategory, slug: string) => {
		const current = getSelected(category);
		const updated = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
		setters[category](updated);
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

		{#each tagsByCategory as { key, label, tags } (key)}
			<div class="mb-3">
				<p class="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
					{label}
				</p>
				<div class="flex flex-row flex-wrap gap-2">
					{#each tags as tag (tag.slug)}
						<TagComponent
							onSelect={() => toggleTag(key, tag.slug)}
							active={getSelected(key).includes(tag.slug)}
						>
							{tag.name}
						</TagComponent>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
