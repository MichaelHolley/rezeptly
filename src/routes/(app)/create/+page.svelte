<script lang="ts">
	import { createRecipe } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import CategoryTagInputComponent from '$lib/components/recipes/CategoryTagInputComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	let typeTags = $state<string[]>([]);
	let cuisineTags = $state<string[]>([]);
	let nutritionTags = $state<string[]>([]);
	let dietTags = $state<string[]>([]);

</script>

<svelte:head>
	<title>rezeptly | New</title>
</svelte:head>

<BreadcrumbComponent breadcrumbs={[{ name: 'Create Recipe', href: '/create' }]} />

<form {...createRecipe} class="flex flex-col gap-4">
	<div class="form-group">
		<Label for="name">Name</Label>
		<Input id="name" placeholder="Name" required {...createRecipe.fields.name.as('text')} />
	</div>
	<div class="form-group">
		<Label for="description">Description</Label>
		<Textarea
			id="description"
			placeholder="Short Recipe Description"
			required
			{...createRecipe.fields.description.as('text')}
		/>
	</div>
	<CategoryTagInputComponent bind:typeTags bind:cuisineTags bind:nutritionTags bind:dietTags />
	{#each typeTags as tag, i (tag)}
		<input {...createRecipe.fields.tagType[i].as('hidden', tag)} />
	{/each}
	{#each cuisineTags as tag, i (tag)}
		<input {...createRecipe.fields.tagCuisine[i].as('hidden', tag)} />
	{/each}
	{#each nutritionTags as tag, i (tag)}
		<input {...createRecipe.fields.tagNutrition[i].as('hidden', tag)} />
	{/each}
	{#each dietTags as tag, i (tag)}
		<input {...createRecipe.fields.tagDiet[i].as('hidden', tag)} />
	{/each}
	<div class="flex flex-row justify-end">
		<Button type="submit" disabled={!!createRecipe.pending}>+ Create</Button>
	</div>
</form>
