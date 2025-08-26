<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Recipe } from '$lib/server/types';
	import CheckIcon from '@lucide/svelte/icons/check';
	import PenIcon from '@lucide/svelte/icons/pen';
	import XIcon from '@lucide/svelte/icons/x';
	import { updateRecipeDetails } from '../../../routes/(app)/[id]/page.remote';
	import DeleteRecipeConfirmationModal from './DeleteRecipeConfirmationModal.svelte';

	const { recipe } = $props<{ recipe: Recipe }>();

	let editDetails = $state(false);
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
			<div class="flex flex-row justify-end gap-2">
				<Button variant="secondary" onclick={() => (editDetails = false)}>
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
				<Button variant="secondary" onclick={() => (editDetails = !editDetails)}>
					<PenIcon />
				</Button>
				<DeleteRecipeConfirmationModal />
			</div>
		</div>

		<p class="mt-1 text-xs text-zinc-400">
			Created: {recipe.createdAt?.toLocaleDateString(undefined, { dateStyle: 'long' })}
		</p>

		<p class="mt-4 text-base font-light text-zinc-500">{recipe.description}</p>
	{/if}
</div>
