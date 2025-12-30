<script lang="ts">
	import { createRecipe } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import TagInputComponent from '$lib/components/recipes/TagInputComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	let tags = $state<string[]>([]);
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
	<TagInputComponent bind:tags />
	{#each tags as tag, i (tag)}
		<input {...createRecipe.fields.tags[i].as('hidden', tag)} value={tag} />
	{/each}
	<div class="flex flex-row justify-end">
		<Button type="submit" disabled={!!createRecipe.pending}>+ Create</Button>
	</div>
</form>
