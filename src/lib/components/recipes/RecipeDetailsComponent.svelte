<script lang="ts">
	import { updateRecipeDetails } from '$lib/api/recipes.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Recipe, Tag } from '$lib/server/types';
	import { favoritesStore } from '$lib/store/favorites';
	import { userCanWrite } from '$lib/store/roles';
	import CheckIcon from '@lucide/svelte/icons/check';
	import PenIcon from '@lucide/svelte/icons/pen';
	import StarIcon from '@lucide/svelte/icons/star';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';
	import DeleteRecipeConfirmationModal from './DeleteRecipeConfirmationModal.svelte';
	import TagComponent from './TagComponent.svelte';
	import TagsContainer from './TagsContainerComponent.svelte';

	const { recipe } = $props<{ recipe: Recipe }>();

	const favorites = favoritesStore;

	let editDetails = $state(false);
	let tagInputValue = $state('');
	let tags = $state<string[]>([]);

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
</script>

<div class="mb-8">
	{#if editDetails}
		<form
			{...updateRecipeDetails.enhance(async ({ submit }) => {
				try {
					await submit();
					editDetails = false;
				} catch (error) {
					console.error(error);
				}
			})}
			class="flex flex-col gap-2"
		>
			<Input
				type="hidden"
				name="recipeId"
				{...updateRecipeDetails.fields.recipeId}
				value={recipe.id}
			/>
			<Input
				placeholder="Name"
				{...updateRecipeDetails.fields.name.as('text')}
				value={recipe.name}
			/>
			<Textarea
				placeholder="Short Recipe Description"
				{...updateRecipeDetails.fields.description.as('text')}
				value={recipe.description}
			/>
			<div class="form-group">
				<Label for="tagsinput">Tags</Label>
				<Input
					name="tagsinput"
					type="text"
					placeholder="Enter a tag-name and confirm with Enter-Key"
					bind:value={tagInputValue}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							if (tagInputValue) {
								tags.push(tagInputValue.trim());
								tagInputValue = '';
							}
						}
					}}
				/>
				<div class="flex flex-row flex-wrap gap-2">
					{#each tags as tag, i}
						<Input {...updateRecipeDetails.fields.tags[i].as('hidden', tag)} value={tag} />
						<TagComponent onClick={() => (tags = tags.filter((t) => t !== tag))}>
							{tag}
						</TagComponent>
					{/each}
				</div>
			</div>
			<div class="flex flex-row justify-end gap-2">
				<Button
					variant="secondary"
					onclick={() => {
						editDetails = false;
						tags = [];
					}}
					disabled={!!updateRecipeDetails.pending}
				>
					<XIcon />
					Cancel
				</Button>
				<Button class="btn btn-primary" type="submit" disabled={!!updateRecipeDetails.pending}>
					<CheckIcon />
					Save
				</Button>
			</div>
		</form>
	{:else}
		<div class="flex flex-row justify-between gap-2">
			<h2>{recipe.name}</h2>
			<div class="flex flex-row justify-end gap-2">
				<div>
					<Button onclick={toggleFavorite} variant="outline">
						{#if favorites.current.includes(recipe.id)}
							<StarIcon class="size-5 fill-yellow-400 text-yellow-400" />
						{:else}
							<StarIcon class="size-5 text-zinc-400" />
						{/if}
					</Button>
				</div>

				{#if $userCanWrite}
					<div>
						<Button
							variant="secondary"
							onclick={() => {
								editDetails = true;
								tags = recipe.tags.map((t: Tag) => t.name);
							}}
						>
							<PenIcon />
						</Button>
					</div>
					<div>
						<DeleteRecipeConfirmationModal trigger={deleteModalTrigger} recipeId={recipe.id} />
					</div>
				{/if}
			</div>
		</div>

		<div class="mt-1 flex flex-row justify-between gap-3">
			<TagsContainer tags={recipe.tags.map((t: Tag) => t.name)} />
			<div class="mt-1 text-xs text-zinc-400">
				Created: {recipe.createdAt?.toLocaleDateString(undefined, { dateStyle: 'long' })}
			</div>
		</div>

		<p class="mt-2 text-base font-light text-zinc-500">{recipe.description}</p>
	{/if}
</div>

{#snippet deleteModalTrigger()}
	<Button class="btn btn-error" variant="destructive" type="submit">
		<TrashIcon />
	</Button>
{/snippet}
