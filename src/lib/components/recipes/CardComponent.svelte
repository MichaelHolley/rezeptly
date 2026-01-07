<script lang="ts">
	import BrokenPreviewUrlComponent from '$lib/components/common/BrokenImagePreview.svelte';
	import NoImagePreviewComponent from '$lib/components/common/NoImagePreviewComponent.svelte';
	import TagsContainerComponent from '$lib/components/recipes/TagsContainerComponent.svelte';
	import * as Card from '$lib/components/ui/card/';
	import type { RecipeMetadata } from '$lib/server/types';

	interface Props {
		recipe: RecipeMetadata;
	}

	const { recipe }: Props = $props();

	let isImageBroken = $state(false);

	const handleImageError = () => {
		isImageBroken = true;
	};
</script>

<Card.Root class="group h-full gap-0 overflow-hidden px-0 pt-0">
	<Card.Header class="p-0">
		<div class="h-48 overflow-hidden">
			{#if recipe.imageUrl && !isImageBroken}
				<img
					src={recipe.imageUrl}
					alt={`Image for ${recipe.name}`}
					loading="lazy"
					class="h-full w-full object-cover object-center group-hover:scale-102 transition-all duration-300"
					onerror={handleImageError}
				/>
			{:else if recipe.imageUrl && isImageBroken}
				<div class="flex h-full justify-center bg-neutral-50/80">
					<BrokenPreviewUrlComponent />
				</div>
			{:else}
				<div class="flex h-full justify-center bg-neutral-50/80">
					<NoImagePreviewComponent />
				</div>
			{/if}
		</div>
		<Card.Title class="truncate px-6 pt-2 pb-1 text-base tracking-tight" title={recipe.name}>
			<span style:view-transition-name="recipe-title-{recipe.id}">{recipe.name}</span>
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<TagsContainerComponent
			tags={recipe.tags.map((t) => t.name)}
			class="-mx-1 mb-3"
			viewTransitionPrefix={`recipe-tag-${recipe.id}`}
		/>
		<p class="line-clamp-3 text-sm text-zinc-500">
			{recipe.description}
		</p>
	</Card.Content>
</Card.Root>
