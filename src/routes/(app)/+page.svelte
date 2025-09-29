<script lang="ts">
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import TagComponent from '$lib/components/recipes/TagComponent.svelte';
	import TagsContainer from '$lib/components/recipes/TagsContainerComponent.svelte';
	import * as Card from '$lib/components/ui/card/';
	import Input from '$lib/components/ui/input/input.svelte';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { Debounced } from 'runed';
	import { getRecipes } from './page.remote';

	let searchTerm = $state('');
	const debouncedSearchTerm = new Debounced(() => searchTerm, 250);
	let activeTagFilter = $state('');

	const recipes = getRecipes();

	const allTags = $derived.by(() => {
		if (recipes.current) {
			const recipeTags = recipes.current.map((r) => r.tags.map((t: { name: string }) => t.name));
			return [...new Set(recipeTags.flat())];
		}

		return [];
	});

	const setActiveTagFilter = (tag: string) => {
		if (activeTagFilter === tag) {
			activeTagFilter = '';
		} else {
			activeTagFilter = tag;
		}
	};

	const filteredRecipes = $derived.by(() => {
		if (recipes.current) {
			return recipes.current.filter((r) => {
				const matchesSearchTerm = r.name
					.toLowerCase()
					.includes(debouncedSearchTerm.current.toLowerCase());

				const matchesTagFilter =
					!activeTagFilter || r.tags.some((t: { name: string }) => t.name === activeTagFilter);

				return matchesSearchTerm && matchesTagFilter;
			});
		}

		return [];
	});
</script>

<svelte:head>
	<title>Rezeptly</title>
</svelte:head>

{#if recipes.current}
	<div class="my-4 flex flex-row justify-center">
		<div class="w-full max-w-xs">
			<div class="mb-2 flex flex-row items-center gap-2">
				<Input placeholder="Search..." class="w-full" bind:value={searchTerm} />
			</div>
			<div class="flex flex-row flex-wrap justify-center gap-2">
				{#each allTags as tag}
					<TagComponent
						{tag}
						onClick={() => setActiveTagFilter(tag)}
						active={activeTagFilter === tag}
					/>
				{/each}
			</div>
		</div>
	</div>
	<div class="card-container my-4 grid gap-4">
		{#each filteredRecipes as recipe}
			<a href="/{recipe.id}" class="max-w-md">
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
{:else if recipes.error}
	<p class="text-red-500">{recipes.error}</p>
{:else}
	<div class="flex flex-col items-center justify-center pt-32">
		<LoadingComponent />
	</div>
{/if}

<style>
	.card-container {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}
</style>
