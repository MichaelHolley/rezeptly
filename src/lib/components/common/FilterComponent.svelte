<script lang="ts">
	import TagComponent from '$lib/components/recipes/TagComponent.svelte';
	import StarIcon from '@lucide/svelte/icons/star';
	import SearchBarComponent from './SearchBarComponent.svelte';

	let {
		searchTerm = $bindable(),
		selectedTag = $bindable(),
		filterFavorites = $bindable(),
		availableTags
	} = $props<{
		searchTerm: string;
		selectedTag: string;
		filterFavorites: boolean;
		availableTags: string[];
	}>();

	const setActiveTagFilter = (tag: string) => {
		if (selectedTag === tag) {
			selectedTag = '';
		} else {
			selectedTag = tag;
		}
	};
</script>

<div class="my-4 flex flex-row justify-center">
	<div class="w-full max-w-xs">
		<div class="mb-2 flex flex-row items-center gap-2">
			<SearchBarComponent bind:searchTerm />
		</div>
		<div class="flex flex-row flex-wrap justify-center gap-2">
			<TagComponent onClick={() => (filterFavorites = !filterFavorites)} active={filterFavorites}>
				<StarIcon class="size-5 fill-yellow-400 text-yellow-400" />
			</TagComponent>
			{#each availableTags as tag}
				<TagComponent onClick={() => setActiveTagFilter(tag)} active={selectedTag === tag}>
					{tag}
				</TagComponent>
			{/each}
		</div>
	</div>
</div>
