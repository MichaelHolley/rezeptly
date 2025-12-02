<script lang="ts">
	import { getAvailableTags, getRecipesMetadata } from '$lib/api/recipes.remote';
	import EmptyComponent from '$lib/components/common/EmptyComponent.svelte';
	import FilterComponent from '$lib/components/common/FilterComponent.svelte';
	import TagsContainerComponent from '$lib/components/recipes/TagsContainerComponent.svelte';
	import * as Card from '$lib/components/ui/card/';
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

	const tagNames = $derived(availableTags.map((t) => t.name));

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
	<title>Rezeptly</title>
</svelte:head>

<FilterComponent
	bind:searchTerm={searchParams.searchTerm}
	bind:selectedTag={searchParams.activeTagFilter}
	bind:filterFavorites={searchParams.filterFavorites}
	availableTags={tagNames}
/>
<div class="card-container my-4 grid gap-4">
	{#each filterRecipes(recipes) as recipe}
		<a href="/{recipe.id}">
			<Card.Root class="group h-full gap-0 overflow-hidden px-0 pt-0">
				<Card.Header class="p-0">
					<div class="h-48 overflow-hidden rounded-xs">
						{#if recipe.imageUrl}
							<img
								src={recipe.imageUrl}
								alt={`Image for ${recipe.name}`}
								class="h-full w-full object-cover object-center"
							/>
						{:else}
							<div class="flex h-full justify-center">
								<EmptyComponent />
							</div>
						{/if}
					</div>
					<Card.Title class="truncate px-6 py-2" title={recipe.name}>{recipe.name}</Card.Title>
				</Card.Header>
				<Card.Content>
					<TagsContainerComponent
						tags={recipe.tags.map((t: { name: string }) => t.name)}
						class="-mx-1 mb-3"
					/>
					<p class="line-clamp-3! flex flex-col gap-0.5 text-sm text-neutral-500">
						{recipe.description}
					</p>
				</Card.Content>
			</Card.Root>
		</a>
	{/each}
</div>

<style>
	.card-container {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
</style>
