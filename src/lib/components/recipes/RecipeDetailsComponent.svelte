<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { RecipeWithDetails, Tag } from '$lib/server/types';
	import { favoritesStore } from '$lib/store/favorites';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import PenIcon from '@lucide/svelte/icons/pen';
	import StarIcon from '@lucide/svelte/icons/star';
	import DeleteRecipeConfirmationModal from './DeleteRecipeConfirmationModal.svelte';
	import RecipeDetailsFormComponent from './RecipeDetailsFormComponent.svelte';
	import TagsContainer from './TagsContainerComponent.svelte';

	const { recipe }: { recipe: RecipeWithDetails } = $props();

	const favorites = favoritesStore;

	let editDetails = $state(false);

	const toggleFavorite = () => {
		if (!recipe) {
			return;
		}

		if (favorites.current.includes(recipe.id)) {
			favorites.current = favorites.current.filter((id) => id !== recipe.id);
		} else {
			favorites.current.push(recipe.id);
		}
	};

	const closeForm = () => {
		editDetails = false;
	};
</script>

<div class="mb-8">
	{#if editDetails}
		<RecipeDetailsFormComponent {recipe} onSave={closeForm} onCancel={closeForm} />
	{:else}
		<div class="flex flex-row justify-between gap-2">
			<h2 class="tracking-tight text-shadow-xs">
				{recipe.name}
			</h2>
			<div class="flex flex-row justify-end gap-2">
				<Button onclick={toggleFavorite} variant="outline" title="Toggle Favorite">
					{#if favorites.current.includes(recipe.id)}
						<StarIcon class="fill-yellow-400 text-yellow-400" />
					{:else}
						<StarIcon class="text-zinc-400" />
					{/if}
				</Button>
				{#if PermissionsStore.canEdit}
					<Button
						variant="secondary"
						onclick={() => {
							editDetails = true;
						}}
						title="Edit Recipe Details"
					>
						<PenIcon />
					</Button>

					<DeleteRecipeConfirmationModal recipeId={recipe.id} />
				{/if}
			</div>
		</div>

		<div class="mt-2 flex flex-row justify-between gap-3">
			{#if recipe.tags?.length > 0}
				<TagsContainer
					tags={recipe.tags.map((tag: Tag) => tag.name)}
					viewTransitionPrefix={`recipe-tag-${recipe.id}`}
				/>
			{/if}
		</div>

		<p class="mt-3 text-sm text-zinc-500 max-w-3xl">
			{recipe.description}
		</p>
	{/if}
</div>
