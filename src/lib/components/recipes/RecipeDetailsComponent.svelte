<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { RecipeWithDetails, Tag } from '$lib/server/types';
	import { favoritesStore } from '$lib/store/favorites';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import { formatDuration } from '$lib/shared/duration';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import PenIcon from '@lucide/svelte/icons/pen';
	import StarIcon from '@lucide/svelte/icons/star';
	import UsersIcon from '@lucide/svelte/icons/users';
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
		<h2
			style:view-transition-name="recipe-title-{recipe.id}"
			class="mt-2 text-3xl font-extrabold tracking-tight text-shadow-xs sm:text-4xl"
		>
			{recipe.name}
		</h2>

		{#if recipe.description}
			<p class="mt-3 text-sm text-zinc-500 max-w-3xl">
				{recipe.description}
			</p>
		{/if}

		{#if recipe.durationMinutes != null || recipe.portions != null}
			<div class="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
				{#if recipe.durationMinutes != null}
					<div class="flex items-center gap-3 rounded-lg border p-3">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-md bg-orange-100 text-orange-600"
						>
							<ClockIcon class="h-5 w-5" />
						</div>
						<div class="flex flex-col">
							<span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
								>Total</span
							>
							<span class="text-sm font-semibold">{formatDuration(recipe.durationMinutes)}</span>
						</div>
					</div>
				{/if}
				{#if recipe.portions != null}
					<div class="flex items-center gap-3 rounded-lg border p-3">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-md bg-orange-100 text-orange-600"
						>
							<UsersIcon class="h-5 w-5" />
						</div>
						<div class="flex flex-col">
							<span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
								>Portions</span
							>
							<span class="text-sm font-semibold">{recipe.portions}</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<div class="mt-4 flex flex-row gap-2">
			<Button onclick={toggleFavorite} variant="outline" title="Toggle Favorite">
				{#if favorites.current.includes(recipe.id)}
					<StarIcon class="fill-yellow-400 text-yellow-400" />
				{:else}
					<StarIcon class="text-zinc-400" />
				{/if}
				Favorite
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

		{#if recipe.tags.length > 0}
			<TagsContainer
				tags={recipe.tags.map((tag: Tag) => tag.name)}
				viewTransitionPrefix={`recipe-tag-${recipe.id}`}
				class="mt-4"
			/>
		{/if}
	{/if}
</div>
