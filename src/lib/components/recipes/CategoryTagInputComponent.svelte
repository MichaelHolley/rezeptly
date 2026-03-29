<script lang="ts">
	import type { TagCategory } from '$lib/server/types';
	import TagInputComponent from './TagInputComponent.svelte';

	let {
		typeTags = $bindable([]),
		cuisineTags = $bindable([]),
		nutritionTags = $bindable([]),
		dietTags = $bindable([])
	}: {
		typeTags?: string[];
		cuisineTags?: string[];
		nutritionTags?: string[];
		dietTags?: string[];
	} = $props();

	const PLACEHOLDERS: Record<TagCategory, string> = {
		type: 'e.g. Cake, Dessert, Pasta, Salad, Sauce …',
		cuisine: 'e.g. Italian, French, Mexican, German …',
		diet: 'e.g. Vegan, Chicken …',
		nutrition: 'e.g. High protein, Low carb …'
	};
</script>

<div class="flex flex-col gap-4">
	<TagInputComponent
		label="Type"
		placeholder={PLACEHOLDERS.type}
		category="type"
		inputId="tag-input-type"
		bind:tags={typeTags}
	/>
	<TagInputComponent
		label="Cuisine"
		placeholder={PLACEHOLDERS.cuisine}
		category="cuisine"
		inputId="tag-input-cuisine"
		bind:tags={cuisineTags}
	/>
	<TagInputComponent
		label="Nutrition"
		placeholder={PLACEHOLDERS.nutrition}
		category="nutrition"
		inputId="tag-input-nutrition"
		bind:tags={nutritionTags}
	/>
	<TagInputComponent
		label="Diet"
		placeholder={PLACEHOLDERS.diet}
		category="diet"
		inputId="tag-input-diet"
		bind:tags={dietTags}
	/>
</div>
