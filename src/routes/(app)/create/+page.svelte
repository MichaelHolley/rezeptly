<script lang="ts">
	import { createRecipe } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/BreadcrumbComponent.svelte';
	import TagComponent from '$lib/components/recipes/TagComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	let tagInputValue = $state('');
	let tags = $state<string[]>([]);
</script>

<svelte:head>
	<title>Rezeptly | New</title>
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
	<div class="form-group">
		<Label for="tagsinput">Tags</Label>
		<Input
			name="tagsinput"
			id="tagsinput"
			type="text"
			placeholder="Enter a tag-name and confirm with Enter-Key"
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
			{#each tags as tag, i}
				<input {...createRecipe.fields.tags[i].as('hidden', tag)} value={tag} />
				<TagComponent
					onClick={() => {
						tags = tags.filter((t) => t !== tag);
					}}
				>
					{tag}
				</TagComponent>
			{/each}
		</div>
	</div>
	<div class="flex flex-row justify-end">
		<Button type="submit" disabled={!!createRecipe.pending}>+ Create</Button>
	</div>
</form>
