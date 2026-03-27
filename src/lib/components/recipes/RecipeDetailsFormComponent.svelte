<script lang="ts">
	import { updateRecipeDetails } from '$lib/api/recipes.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { RecipeWithDetails, TagCategory } from '$lib/server/types';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import CategoryTagInputComponent from './CategoryTagInputComponent.svelte';

	const {
		onSave,
		onCancel,
		recipe
	}: { onSave?: () => void; onCancel?: () => void; recipe: RecipeWithDetails } = $props();

	function getTagByCategory(category: TagCategory): string {
		return recipe.tags.find((t) => t.category === category)?.name ?? '';
	}

	let typeTag = $state(getTagByCategory('type'));
	let cuisineTag = $state(getTagByCategory('cuisine'));
	let nutritionTag = $state(getTagByCategory('nutrition'));
	let dietTag = $state(getTagByCategory('diet'));
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
	<Input
		placeholder="Name"
		{...updateRecipeDetails.fields.name.as('text')}
		value={recipe.name}
		required
	/>
	<Textarea
		placeholder="Short Recipe Description"
		{...updateRecipeDetails.fields.description.as('text')}
		value={recipe.description}
		required
	/>
	<CategoryTagInputComponent bind:typeTag bind:cuisineTag bind:nutritionTag bind:dietTag />
	{#if typeTag}
		<input {...updateRecipeDetails.fields.tagType.as('hidden', typeTag)} />
	{/if}
	{#if cuisineTag}
		<input {...updateRecipeDetails.fields.tagCuisine.as('hidden', cuisineTag)} />
	{/if}
	{#if nutritionTag}
		<input {...updateRecipeDetails.fields.tagNutrition.as('hidden', nutritionTag)} />
	{/if}
	{#if dietTag}
		<input {...updateRecipeDetails.fields.tagDiet.as('hidden', dietTag)} />
	{/if}
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
