<script lang="ts">
	import { page } from '$app/state';
	import { suggestRecipeTags, updateRecipeDetails } from '$lib/api/recipes.remote';
	import FieldIssues from '$lib/components/common/FieldIssues.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import SingleSelectComponent from '$lib/components/common/SingleSelectComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { RecipeWithDetails, TagCategory } from '$lib/server/types';
	import type { RecipeCourse } from '$lib/shared/course';
	import { DURATION_BUCKETS, formatDuration } from '$lib/shared/duration';
	import { reportError } from '$lib/shared/toast';
	import CheckIcon from '@lucide/svelte/icons/check';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import XIcon from '@lucide/svelte/icons/x';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';
	import CategoryTagInputComponent from './CategoryTagInputComponent.svelte';
	import CoursePickerComponent from './CoursePickerComponent.svelte';

	const {
		onSave,
		onCancel,
		recipe
	}: { recipe: RecipeWithDetails; onSave?: () => void; onCancel?: () => void } = $props();

	function getTagsByCategory(category: TagCategory): string[] {
		return recipe.tags.filter((t) => t.category === category).map((t) => t.name);
	}

	let typeTags = $state(getTagsByCategory('type'));
	let cuisineTags = $state(getTagsByCategory('cuisine'));
	let nutritionTags = $state(getTagsByCategory('nutrition'));
	let dietTags = $state(getTagsByCategory('diet'));
	let durationMinutes = $state<number | null>(untrack(() => recipe.durationMinutes));
	let course = $state<RecipeCourse | null>(untrack(() => recipe.course));
	let suggestedTags = $state<Record<TagCategory, string[]> | null>(null);

	const durationOptions = DURATION_BUCKETS.map((min) => ({
		value: min,
		label: formatDuration(min)!
	}));

	const hasIngredients = $derived(recipe.ingredients.length > 0);

	async function handleSuggestTags() {
		try {
			const result = await suggestRecipeTags(recipe.id);
			suggestedTags = result;

			const hasSuggestions = Object.values(result).some((names) => names.length > 0);
			if (!hasSuggestions) {
				toast.info('No new tag suggestions found.');
			}
		} catch (error) {
			reportError(error);
		}
	}
</script>

<form
	{...updateRecipeDetails.enhance(async ({ submit }) => {
		try {
			if (await submit()) {
				onSave?.();
			}
		} catch (error) {
			reportError(error);
		}
	})}
	class="flex flex-col gap-2"
>
	<input {...updateRecipeDetails.fields.recipeId.as('hidden', recipe.id)} />
	<div class="form-group">
		<Input
			placeholder="Name"
			{...updateRecipeDetails.fields.name.as('text', recipe.name)}
			required
		/>
		<FieldIssues issues={updateRecipeDetails.fields.name.issues()} />
	</div>
	<div class="form-group">
		<Textarea
			placeholder="Short Recipe Description"
			{...updateRecipeDetails.fields.description.as('text', recipe.description ?? '')}
			required
		/>
		<FieldIssues issues={updateRecipeDetails.fields.description.issues()} />
	</div>
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
	<CoursePickerComponent bind:value={course} />
	{#if course != null}
		<input {...updateRecipeDetails.fields.course.as('hidden', course)} />
	{/if}
	{#if page.data.features.tagSuggestions}
		<div class="mt-4 flex flex-row items-center gap-2">
			<Button
				type="button"
				variant="outline"
				onclick={handleSuggestTags}
				disabled={!hasIngredients || !!suggestRecipeTags.pending}
				title={!hasIngredients ? 'Add ingredients first to get tag suggestions' : undefined}
			>
				{#if suggestRecipeTags.pending}
					<LoadingComponent class="size-4" />
				{:else}
					<SparklesIcon />
				{/if}
				Suggest with AI
			</Button>
			{#if !hasIngredients}
				<p class="text-xs text-zinc-500">Add ingredients to enable AI tag suggestions.</p>
			{/if}
		</div>
	{/if}
	<CategoryTagInputComponent
		bind:typeTags
		bind:cuisineTags
		bind:nutritionTags
		bind:dietTags
		{suggestedTags}
		class="mt-4"
	/>
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
				updateRecipeDetails.element?.reset();
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
