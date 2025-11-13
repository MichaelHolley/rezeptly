<script lang="ts">
	import { getRecipesMetadata } from '$lib/api/recipes.remote';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import SearchBar from '$lib/components/common/SearchBarComponent.svelte';
	import TagComponent from '$lib/components/recipes/TagComponent.svelte';
	import TagsContainer from '$lib/components/recipes/TagsContainerComponent.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { favoritesStore } from '$lib/store/favorites';
	import { userCanWrite } from '$lib/store/roles';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CookingPot from '@lucide/svelte/icons/cooking-pot';
	import StarIcon from '@lucide/svelte/icons/star';
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

	const recipes = getRecipesMetadata();

	const allTags = $derived.by(() => {
		if (recipes.current) {
			const recipeTags = recipes.current.map((r) => r.tags.map((t: { name: string }) => t.name));
			return [...new Set(recipeTags.flat())];
		}

		return [];
	});

	const setActiveTagFilter = (tag: string) => {
		if (searchParams.activeTagFilter === tag) {
			searchParams.activeTagFilter = '';
		} else {
			searchParams.activeTagFilter = tag;
		}
	};

	const filteredRecipes = $derived.by(() => {
		if (recipes.current) {
			return recipes.current.filter((r) => {
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
	});
</script>

<svelte:head>
	<title>Rezeptly</title>
</svelte:head>

{#if recipes.current}
	{#if filteredRecipes.length > 0}
		<div class="my-4 flex flex-row justify-center">
			<div class="w-full max-w-xs">
				<div class="mb-2 flex flex-row items-center gap-2">
					<SearchBar bind:searchTerm={searchParams.searchTerm} />
				</div>
				<div class="flex flex-row flex-wrap justify-center gap-2">
					<TagComponent
						onClick={() => (searchParams.filterFavorites = !searchParams.filterFavorites)}
						active={searchParams.filterFavorites}
					>
						<StarIcon class="h-5 w-5 fill-yellow-400 text-yellow-400" />
					</TagComponent>
					{#each allTags as tag}
						<TagComponent
							onClick={() => setActiveTagFilter(tag)}
							active={searchParams.activeTagFilter === tag}
						>
							{tag}
						</TagComponent>
					{/each}
				</div>
			</div>
		</div>
		<div class="card-container my-4 grid gap-4">
			{#each filteredRecipes as recipe}
				<a href="/{recipe.id}">
					<Card.Root class="group h-full">
						<Card.Header>
							<Card.Title class="truncate pb-1">{recipe.name}</Card.Title>
							<Card.Description>
								<TagsContainer
									tags={recipe.tags.map((t: { name: string }) => t.name)}
									class="-mx-1 mb-2"
								/>
								<p class="line-clamp-3">{recipe.description}</p>
							</Card.Description>
							<Card.Action>
								<ArrowRightIcon
									class="h-4 w-4 text-zinc-400 transition-all group-hover:text-zinc-700"
								/>
							</Card.Action>
						</Card.Header>
					</Card.Root>
				</a>
			{/each}
		</div>
	{:else}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<CookingPot />
				</Empty.Media>
				<Empty.Title>No data</Empty.Title>
				<Empty.Description>No Recipes found</Empty.Description>
			</Empty.Header>
			{#if $userCanWrite}
				<Empty.Content>
					<Button href="/create">+ Create Recipe</Button>
				</Empty.Content>
			{/if}
		</Empty.Root>
	{/if}
{:else if recipes.error}
	<p class="text-red-500">{recipes.error}</p>
{:else}
	<div class="flex flex-col items-center justify-center pt-32">
		<LoadingComponent />
	</div>
{/if}

<style>
	.card-container {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
</style>
