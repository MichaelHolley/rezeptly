<script lang="ts">
	import { getAvailableTags, getRecipesMetadata } from '$lib/api/recipes.remote';
	import FilterComponent from '$lib/components/common/FilterComponent.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
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

<svelte:boundary>
	{@const recipes = await getRecipesMetadata()}
	{@const availableTags = await getAvailableTags()}

	<FilterComponent
		bind:searchTerm={searchParams.searchTerm}
		bind:selectedTag={searchParams.activeTagFilter}
		bind:filterFavorites={searchParams.filterFavorites}
		availableTags={availableTags.map((t) => t.name)}
	/>

	<div class="card-container my-4 grid gap-4">
		{#each filterRecipes(recipes) as recipe (recipe.id)}
			<a href="/{recipe.id}">
				<CardComponent {recipe} />
			</a>
		{/each}
	</div>

	{#snippet pending()}
		<div class="flex h-64 items-center justify-center">
			<LoadingComponent class="h-8 w-8" />
		</div>
	{/snippet}

	{#snippet failed(error: any, reset)}
		<div class="flex flex-col items-center justify-center gap-4 py-12 text-center">
			<p class="text-destructive font-medium">Failed to load recipes</p>
			<p class="text-muted-foreground text-sm">{error?.message ?? 'Unknown error'}</p>
			<button
				onclick={reset}
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm transition-colors"
			>
				Try again
			</button>
		</div>
	{/snippet}
</svelte:boundary>

<style>
	.card-container {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
</style>
