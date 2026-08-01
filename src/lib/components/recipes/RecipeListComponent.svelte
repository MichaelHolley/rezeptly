<script lang="ts">
	import CardComponent from '$lib/components/recipes/CardComponent.svelte';
	import FilterComponent from '$lib/components/recipes/FilterComponent.svelte';
	import type { RecipeMetadata } from '$lib/server/types';
	import { TAG_CATEGORIES } from '$lib/shared/tags';
	import { AvailableTagsStore } from '$lib/store/available-tags.svelte';
	import { favoritesStore } from '$lib/store/favorites';
	import { Debounced } from 'runed';
	import { useSearchParams } from 'runed/kit';
	import z from 'zod';

	const { recipes }: { recipes: RecipeMetadata[] } = $props();

	const favorites = favoritesStore;

	const searchParams = useSearchParams(
		z.object({
			filterFavorites: z.boolean().default(false),
			searchTerm: z.string().optional().default(''),
			type: z.array(z.string()).default([]),
			cuisine: z.array(z.string()).default([]),
			nutrition: z.array(z.string()).default([]),
			diet: z.array(z.string()).default([])
		})
	);

	const debouncedSearchTerm = new Debounced(() => searchParams.searchTerm, 250);

	const filteredRecipes = $derived(
		(recipes ?? []).filter((r) => {
			const matchesSearchTerm =
				!searchParams.searchTerm ||
				r.name.toLowerCase().includes(debouncedSearchTerm.current.toLowerCase());

			const matchesTagFilter = TAG_CATEGORIES.every((category) => {
				const selected = searchParams[category] as string[];
				if (!selected || selected.length === 0) return true;
				return r.tags.some((t) => t.category === category && selected.includes(t.slug));
			});

			const matchesFavoritesFilter =
				!searchParams.filterFavorites || favorites.current.includes(r.id);

			return matchesSearchTerm && matchesTagFilter && matchesFavoritesFilter;
		})
	);
</script>

<FilterComponent
	bind:searchTerm={searchParams.searchTerm}
	bind:filterFavorites={searchParams.filterFavorites}
	bind:type={searchParams.type}
	bind:cuisine={searchParams.cuisine}
	bind:nutrition={searchParams.nutrition}
	bind:diet={searchParams.diet}
	availableTags={AvailableTagsStore.tags}
/>

<div class="card-container my-4 grid gap-4">
	{#each filteredRecipes as recipe (recipe.id)}
		<a
			href="/{recipe.slug}"
			class="block transition-all duration-200 hover:shadow-xl active:scale-[0.98] rounded-xl"
		>
			<CardComponent {recipe} />
		</a>
	{/each}
</div>

<style>
	.card-container {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
</style>
