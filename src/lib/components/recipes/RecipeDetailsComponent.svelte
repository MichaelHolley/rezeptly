<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { RecipeWithDetails, Tag } from '$lib/server/types';
	import { favoritesStore } from '$lib/store/favorites';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import { COURSE_LABELS } from '$lib/shared/course';
	import { formatDuration } from '$lib/shared/duration';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import PenIcon from '@lucide/svelte/icons/pen';
	import StarIcon from '@lucide/svelte/icons/star';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { COURSE_ICONS } from './course-icons';
	import DeleteRecipeConfirmationModal from './DeleteRecipeConfirmationModal.svelte';
	import DraftBadgeComponent from './DraftBadgeComponent.svelte';
	import PublishButtonComponent from './PublishButtonComponent.svelte';
	import RecipeDetailsFormComponent from './RecipeDetailsFormComponent.svelte';
	import RecipeStat from './RecipeStatComponent.svelte';
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
		<div class="mt-2 flex flex-row flex-wrap items-center gap-3">
			<h2
				style:view-transition-name="recipe-title-{recipe.id}"
				class="font-fraunces text-3xl font-extrabold tracking-tight text-shadow-xs sm:text-4xl"
			>
				{recipe.name}
			</h2>
			<DraftBadgeComponent publishedAt={recipe.publishedAt} />
			<div class="ml-auto">
				<PublishButtonComponent recipeId={recipe.id} publishedAt={recipe.publishedAt} />
			</div>
		</div>

		{#if recipe.description}
			<p class="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
				{recipe.description}
			</p>
		{/if}

		{#if recipe.durationMinutes != null || recipe.portions != null || recipe.course != null}
			<div class="mt-4 grid grid-cols-2 gap-3 sm:max-w-xl sm:grid-cols-3">
				{#if recipe.durationMinutes != null}
					<RecipeStat
						icon={ClockIcon}
						label="Total"
						value={formatDuration(recipe.durationMinutes)}
					/>
				{/if}
				{#if recipe.portions != null}
					<RecipeStat icon={UsersIcon} label="Portions" value={recipe.portions} />
				{/if}
				{#if recipe.course != null}
					<RecipeStat
						icon={COURSE_ICONS[recipe.course]}
						label="Course"
						value={COURSE_LABELS[recipe.course]}
					/>
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
