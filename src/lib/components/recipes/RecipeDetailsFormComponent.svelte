<script lang="ts">
	import { updateRecipeDetails } from '$lib/api/recipes.remote';
	import SingleSelectComponent from '$lib/components/common/SingleSelectComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { RecipeWithDetails, TagCategory } from '$lib/server/types';
	import { DURATION_BUCKETS, formatDuration } from '$lib/utils';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import CategoryTagInputComponent from './CategoryTagInputComponent.svelte';

	const {
		onSave,
		onCancel,
		recipe
	}: { onSave?: () => void; onCancel?: () => void; recipe: RecipeWithDetails } = $props();

	function getTagsByCategory(category: TagCategory): string[] {
		return recipe.tags.filter((t) => t.category === category).map((t) => t.name);
	}

	let typeTags = $state(getTagsByCategory('type'));
	let cuisineTags = $state(getTagsByCategory('cuisine'));
	let nutritionTags = $state(getTagsByCategory('nutrition'));
	let dietTags = $state(getTagsByCategory('diet'));
	let durationMinutes = $state<number | null>(recipe.durationMinutes);

	const durationOptions = DURATION_BUCKETS.map((min) => ({
		value: min,
		label: formatDuration(min)!
	}));
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
	<div class="flex flex-row flex-wrap gap-2">
		<SingleSelectComponent
			label="Duration"
			options={durationOptions}
			value={durationMinutes}
			onchange={(v) => (durationMinutes = v)}
		/>
	</div>
	{#if durationMinutes != null}
		<input
			{...updateRecipeDetails.fields.durationMinutes.as('number', durationMinutes)}
			class="hidden"
		/>
	{/if}
	<CategoryTagInputComponent bind:typeTags bind:cuisineTags bind:nutritionTags bind:dietTags />
	{#each typeTags as tag, i (tag)}
		<input {...updateRecipeDetails.fields.tagType[i].as('hidden', tag)} />
	{/each}
	{#each cuisineTags as tag, i (tag)}
		<input {...updateRecipeDetails.fields.tagCuisine[i].as('hidden', tag)} />
	{/each}
	{#each nutritionTags as tag, i (tag)}
		<input {...updateRecipeDetails.fields.tagNutrition[i].as('hidden', tag)} />
	{/each}
	{#each dietTags as tag, i (tag)}
		<input {...updateRecipeDetails.fields.tagDiet[i].as('hidden', tag)} />
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
