<script lang="ts">
	import BreadcrumbComponent from '$lib/components/common/BreadcrumbComponent.svelte';
	import TagComponent from '$lib/components/recipes/TagComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createRecipe } from './page.remote';

	let tagInputValue = $state('');
	let tags = $state<string[]>([]);
</script>

<BreadcrumbComponent breadcrumbs={[{ name: 'Create Recipe', href: '/create' }]} />

<form
	{...createRecipe.enhance(async ({ form, data, submit }) => {
		try {
			await submit();
			await form.reset();
		} catch (error) {
			console.error(error);
		}
	})}
	class="flex flex-col gap-4"
>
	<div class="form-group">
		<Label for="name">Name</Label>
		<Input name="name" type="text" placeholder="Name" required />
	</div>
	<div class="form-group">
		<Label>Description</Label>
		<Textarea name="description" placeholder="Short Recipe Description" required />
	</div>
	<div class="form-group">
		<Label for="tags-input">Tags</Label>
		<Input
			name="tags-input"
			type="text"
			placeholder="Enter a tag-name and press enter"
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
			{#each tags as tag}
				<Input type="hidden" name="tags[]" value={tag} />
				<TagComponent
					{tag}
					onClick={() => {
						tags = tags.filter((t) => t !== tag);
					}}
				/>
			{/each}
		</div>
	</div>
	<div class="flex flex-row justify-end">
		<Button type="submit">+ Create</Button>
	</div>
</form>
