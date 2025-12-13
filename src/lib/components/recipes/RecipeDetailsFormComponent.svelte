<script lang="ts">
	import { updateRecipeDetails } from '$lib/api/recipes.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { RecipeWithDetails } from '$lib/server/types';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';
	import TagInputComponent from './TagInputComponent.svelte';

	const {
		onSave,
		onCancel,
		recipe
	}: { onSave?: () => void; onCancel?: () => void; recipe: RecipeWithDetails } = $props();

	let tags = $state<string[]>([]);

	onMount(() => {
		tags = recipe.tags.map((t) => t.name);
	});
</script>

<form
	{...updateRecipeDetails.enhance(async ({ submit }) => {
		try {
			await submit();
			onSave?.();
		} catch (error) {
			console.error(error);
		}
	})}
	class="flex flex-col gap-2"
>
	<input {...updateRecipeDetails.fields.recipeId.as('hidden', recipe.id)} />
	<Input placeholder="Name" {...updateRecipeDetails.fields.name.as('text')} value={recipe.name} />
	<Textarea
		placeholder="Short Recipe Description"
		{...updateRecipeDetails.fields.description.as('text')}
		value={recipe.description}
	/>
	<TagInputComponent bind:tags />
	{#each tags as tag, i (tag)}
		<input {...updateRecipeDetails.fields.tags[i].as('hidden', tag)} value={tag} />
	{/each}
	<div class="flex flex-row justify-end gap-2">
		<Button
			variant="secondary"
			onclick={() => {
				onCancel?.();
			}}
			disabled={!!updateRecipeDetails.pending}
		>
			<XIcon />
			Cancel
		</Button>
		<Button type="submit" disabled={!!updateRecipeDetails.pending}>
			<CheckIcon />
			Save
		</Button>
	</div>
</form>
