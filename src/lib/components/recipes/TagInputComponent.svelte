<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import XIcon from '@lucide/svelte/icons/x';
	import * as InputGroup from '../ui/input-group';
	import TagComponent from './TagComponent.svelte';

	let {
		tags = $bindable()
	}: {
		tags: string[];
	} = $props();

	let tagInputValue = $state('');

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();

			const trimmedValue = tagInputValue.trim();

			if (tags.includes(trimmedValue)) {
				tagInputValue = '';
				return;
			}

			if (trimmedValue && !tags.includes(trimmedValue)) {
				tags = [...tags, trimmedValue];
				tagInputValue = '';
			}
		}
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}
</script>

<div class="form-group">
	<Label for="tagsinput">Tags</Label>

	<InputGroup.Root class="h-fit!">
		<InputGroup.Input
			name="tagsinput"
			id="tagsinput"
			type="text"
			placeholder="Enter a tag-name and confirm with Enter-Key"
			bind:value={tagInputValue}
			onkeydown={handleInputKeydown}
		/>
		<InputGroup.Addon align="inline-start">
			<div class="flex flex-row flex-wrap gap-2">
				{#each tags as tag (tag)}
					<TagComponent onSelect={() => removeTag(tag)}>
						{tag}
						<XIcon />
					</TagComponent>
				{/each}
			</div>
		</InputGroup.Addon>
	</InputGroup.Root>
</div>
