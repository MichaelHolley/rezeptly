<script lang="ts">
	import { getAvailableTags, getRecipesMetadata } from '$lib/api/recipes.remote';
	import FilterComponent from '$lib/components/common/FilterComponent.svelte';
	import CardComponent from '$lib/components/recipes/CardComponent.svelte';
	import type { RecipeMetadata } from '$lib/server/types';
	import { favoritesStore } from '$lib/store/favorites';
	import { Debounced } from 'runed';
	import { useSearchParams } from 'runed/kit';
	import z from 'zod';

	const favorites = favoritesStore;
	const searchParams = useSearchParams(
		z.object({
			filterFavorites: z.boolean().default(false),
			searchTerm: z.string().optional().default(''),
			activeTagFilter: z.string().optional().default('')
		})
	);

	const debouncedSearchTerm = new Debounced(() => searchParams.searchTerm, 250);

	const recipes = $derived(await getRecipesMetadata());
	const availableTags = $derived(await getAvailableTags());

	const filterRecipes = (recipes: RecipeMetadata[]) => {
		if (!recipes) {
			return [];
		}

		return recipes.filter((r) => {
			const matchesSearchTerm =
				!searchParams.searchTerm ||
				r.name.toLowerCase().includes(debouncedSearchTerm.current.toLowerCase());

			const matchesTagFilter =
				!searchParams.activeTagFilter ||
				r.tags.some((t: { name: string }) => t.name === searchParams.activeTagFilter);

			const matchesFavoritesFilter =
				!searchParams.filterFavorites || favorites.current.includes(r.id);

			return matchesSearchTerm && matchesTagFilter && matchesFavoritesFilter;
		});
	};
</script>

<svelte:head>
	<title>rezeptly</title>
</svelte:head>

<FilterComponent
	bind:searchTerm={searchParams.searchTerm}
	bind:selectedTag={searchParams.activeTagFilter}
	bind:filterFavorites={searchParams.filterFavorites}
	availableTags={availableTags.map((t) => t.name)}
/>

<div class="card-container my-4 grid gap-4">
	{#each filterRecipes(recipes) as recipe (recipe.id)}
		<a href="/{recipe.slug}">
			<CardComponent {recipe} />
		</a>
	{/each}
</div>

<style>
	.card-container {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
</style>
