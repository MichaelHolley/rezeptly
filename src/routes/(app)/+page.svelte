<script lang="ts">
	import { getAvailableTags, getRecipesMetadata } from '$lib/api/recipes.remote';
	import FilterComponent from '$lib/components/common/FilterComponent.svelte';
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

	const recipes = $derived(await getRecipesMetadata());

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
	availableTags={(await getAvailableTags()).map((t) => t.name)}
/>
<div class="card-container my-4 grid gap-4">
	{#each filterRecipes(recipes) as recipe}
		<a href="/{recipe.id}">
			<Card.Root class="group h-full gap-1">
				<Card.Header>
					<Card.Title class="truncate pb-1">{recipe.name}</Card.Title>
					<Card.Action>
						<ArrowRightIcon class="size-4 text-zinc-400 transition-all group-hover:text-zinc-700" />
					</Card.Action>
				</Card.Header>
				<Card.Content>
					<TagsContainerComponent
						tags={recipe.tags.map((t: { name: string }) => t.name)}
						class="-mx-1 mb-2"
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
