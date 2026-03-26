<script lang="ts">
	import { createRecipe } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import CategoryTagInputComponent from '$lib/components/recipes/CategoryTagInputComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	let typeTag = $state('');
	let cuisineTag = $state('');
	let nutritionTag = $state('');
	let dietTag = $state('');
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
	<CategoryTagInputComponent
		bind:typeTag
		bind:cuisineTag
		bind:nutritionTag
		bind:dietTag
	/>
	{#if typeTag}
		<input {...createRecipe.fields.tagType.as('hidden', typeTag)} />
	{/if}
	{#if cuisineTag}
		<input {...createRecipe.fields.tagCuisine.as('hidden', cuisineTag)} />
	{/if}
	{#if nutritionTag}
		<input {...createRecipe.fields.tagNutrition.as('hidden', nutritionTag)} />
	{/if}
	{#if dietTag}
		<input {...createRecipe.fields.tagDiet.as('hidden', dietTag)} />
	{/if}
	<div class="flex flex-row justify-end">
		<Button type="submit" disabled={!!createRecipe.pending}>+ Create</Button>
	</div>
</form>
