<script lang="ts">
	import { updateRecipeDetails } from '$lib/api/recipes.remote';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { RecipeWithDetails } from '$lib/server/types';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import TagComponent from './TagComponent.svelte';

	const {
		onSave,
		onCancel,
		recipe
	}: { onSave?: () => void; onCancel?: () => void; recipe: RecipeWithDetails } = $props();

	let tagInputValue = $state('');
	let tags = $state<string[]>([]);

	$effect(() => {
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
	<div class="form-group">
		<Label for="tagsinput">Tags</Label>
		<Input
			name="tagsinput"
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
			{#each tags as tag, i (tag)}
				<input {...updateRecipeDetails.fields.tags[i].as('hidden', tag)} value={tag} />
				<TagComponent onSelect={() => (tags = tags.filter((t) => t !== tag))}>
					{tag}
				</TagComponent>
			{/each}
		</div>
	</div>
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
