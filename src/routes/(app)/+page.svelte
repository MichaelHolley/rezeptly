<script lang="ts">
	import { getRecipesMetadata } from '$lib/api/recipes.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import FilterComponent from '$lib/components/common/FilterComponent.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import CardComponent from '$lib/components/recipes/CardComponent.svelte';
	import type { RecipeMetadata, TagCategory } from '$lib/server/types';
	import { AvailableTagsStore } from '$lib/store/available-tags.svelte';
	import { favoritesStore } from '$lib/store/favorites';
	import { Debounced } from 'runed';
	import { useSearchParams } from 'runed/kit';
	import z from 'zod';

	const favorites = favoritesStore;

	const TAG_CATEGORIES: TagCategory[] = ['type', 'cuisine', 'nutrition', 'diet'];

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

	const filterRecipes = (recipes: RecipeMetadata[]) => {
		if (!recipes) {
			return [];
		}

		return recipes.filter((r) => {
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
		});
	};
</script>

<svelte:head>
	<title>rezeptly</title>
</svelte:head>

<svelte:boundary>
	{@const recipes = await getRecipesMetadata()}

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
		{#each filterRecipes(recipes) as recipe (recipe.id)}
			<a href="/{recipe.slug}">
				<CardComponent {recipe} />
			</a>
		{/each}
	</div>

	{#snippet pending()}
		<div class="flex h-64 items-center justify-center">
			<LoadingComponent class="h-8 w-8" />
		</div>
	{/snippet}

	{#snippet failed(error, retry)}
		<ErrorComponent {error} {retry} />
	{/snippet}
</svelte:boundary>

<style>
	.card-container {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
</style>
