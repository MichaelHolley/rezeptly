<script lang="ts">
	import { getAvailableTags, getRecipesMetadata } from '$lib/api/recipes.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import FilterComponent from '$lib/components/common/FilterComponent.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import TagsContainerComponent from '$lib/components/recipes/TagsContainerComponent.svelte';
	import * as Card from '$lib/components/ui/card/';
	import type { RecipeMetadata } from '$lib/server/types';
	import { favoritesStore } from '$lib/store/favorites';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
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

	const debouncedSearchTerm = new Debounced(() => searchParams.searchTerm, 100);

	const filterRecipes = (recipes: RecipeMetadata[]) => {
		if (recipes) {
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
		}

		return [];
	};
</script>

<svelte:head>
	<title>Rezeptly</title>
</svelte:head>

<svelte:boundary onerror={(error) => console.error(error)}>
	{@const recipesData = await getRecipesMetadata()}
	{@const availableTags = await getAvailableTags()}

	<FilterComponent
		bind:searchTerm={searchParams.searchTerm}
		bind:selectedTag={searchParams.activeTagFilter}
		bind:filterFavorites={searchParams.filterFavorites}
		availableTags={availableTags.map((t) => t.name)}
	/>
	<div class="card-container my-4 grid gap-4">
		{#each filterRecipes(recipesData) as recipe}
			<a href="/{recipe.id}">
				<Card.Root class="group h-full">
					<Card.Header>
						<Card.Title class="truncate pb-1">{recipe.name}</Card.Title>
						<Card.Description>
							<TagsContainerComponent
								tags={recipe.tags.map((t: { name: string }) => t.name)}
								class="-mx-1 mb-2"
							/>
							<p class="line-clamp-3">{recipe.description}</p>
						</Card.Description>
						<Card.Action>
							<ArrowRightIcon
								class="size-4 text-zinc-400 transition-all group-hover:text-zinc-700"
							/>
						</Card.Action>
					</Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>

	{#snippet pending()}
		<div class="flex flex-col items-center justify-center pt-32">
			<LoadingComponent />
		</div>
	{/snippet}

	{#snippet failed(error, reset)}
		<ErrorComponent
			message={error instanceof Error ? error.message : `Failed to load recipes: ${error}`}
			onRetry={reset}
		/>
	{/snippet}
</svelte:boundary>

<style>
	.card-container {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
</style>
