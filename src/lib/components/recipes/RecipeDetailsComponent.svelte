<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Recipe, Tag } from '$lib/server/types';
	import CheckIcon from '@lucide/svelte/icons/check';
	import PenIcon from '@lucide/svelte/icons/pen';
	import XIcon from '@lucide/svelte/icons/x';
	import { updateRecipeDetails } from '../../../routes/(app)/[id]/page.remote';
	import DeleteRecipeConfirmationModal from './DeleteRecipeConfirmationModal.svelte';
	import TagComponent from './TagComponent.svelte';
	import TagsContainer from './TagsContainerComponent.svelte';

	const { recipe } = $props<{ recipe: Recipe }>();

	let editDetails = $state(false);

	let tagInputValue = $state('');
	let tags = $state<string[]>([]);
</script>

<div class="mb-8">
	{#if editDetails}
		<form
			{...updateRecipeDetails.enhance(async ({ form, submit }) => {
				try {
					await submit();

					editDetails = false;
					await form.reset();
				} catch (error) {
					console.error(error);
				}
			})}
			class="flex flex-col gap-2"
		>
			<Input type="hidden" name="recipeId" value={recipe.id} />
			<Input name="name" type="text" value={recipe.name} placeholder="Name" />
			<Textarea
				name="description"
				value={recipe.description}
				placeholder="Short Recipe Description"
			/>
			<div class="form-group">
				<Label for="tags-input">Tags</Label>
				<Input
					name="tags-input"
					type="text"
					placeholder="Enter a tag-name and press enter"
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
					{#each tags as tag}
						<Input type="hidden" name="tags[]" value={tag} />
						<TagComponent {tag} onClick={() => (tags = tags.filter((t) => t !== tag))} />
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
				>
					<XIcon />
					Cancel
				</Button>
				<Button class="btn btn-primary" type="submit">
					<CheckIcon />
					Save
				</Button>
			</div>
		</form>
	{:else}
		<div class="flex flex-row justify-between">
			<h2>{recipe.name}</h2>
			<div class="flex flex-row justify-end gap-2">
				<Button
					variant="secondary"
					onclick={() => {
						editDetails = true;
						tags = recipe.tags.map((t: Tag) => t.name);
					}}
				>
					<PenIcon />
				</Button>
				<DeleteRecipeConfirmationModal />
			</div>
		</div>

		<div class="mt-1 flex flex-row justify-between gap-3">
			<TagsContainer tags={recipe.tags.map((t: Tag) => t.name)} />
			<div class="mt-1 text-xs text-zinc-400">
				Created: {recipe.createdAt?.toLocaleDateString(undefined, { dateStyle: 'long' })}
			</div>
		</div>

		<p class="mt-4 text-base font-light text-zinc-500">{recipe.description}</p>
	{/if}
</div>
