<script lang="ts">
	import ImagePlaceholderComponent from '$lib/components/common/ImagePlaceholderComponent.svelte';
	import DraftBadgeComponent from '$lib/components/recipes/DraftBadgeComponent.svelte';
	import TagsContainerComponent from '$lib/components/recipes/TagsContainerComponent.svelte';
	import * as Card from '$lib/components/ui/card/';
	import type { RecipeMetadata } from '$lib/server/types';
	import { COURSE_LABELS } from '$lib/shared/course';
	import { formatDuration } from '$lib/shared/duration';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { COURSE_ICONS } from './course-icons';

	interface Props {
		recipe: RecipeMetadata;
	}

	const { recipe }: Props = $props();

	let isImageBroken = $state(false);

	const handleImageError = () => {
		isImageBroken = true;
	};
</script>

<Card.Root class="group h-full gap-0 overflow-hidden bg-white! px-0 py-0 [background-image:none]!">
	<Card.Header class="p-0">
		<div class="relative h-48 overflow-hidden">
			<DraftBadgeComponent publishedAt={recipe.publishedAt} class="absolute top-2 left-2 z-10" />
			{#if recipe.imageUrl && !isImageBroken}
				<img
					src={recipe.imageUrl}
					alt={`Image for ${recipe.name}`}
					loading="lazy"
					class="h-full w-full object-cover object-center group-hover:scale-102 transition-all duration-300"
					onerror={handleImageError}
				/>
			{:else if recipe.imageUrl && isImageBroken}
				<div class="flex h-full justify-center bg-neutral-50">
					<ImagePlaceholderComponent variant="broken" />
				</div>
			{:else}
				<div class="flex h-full justify-center bg-neutral-50">
					<ImagePlaceholderComponent />
				</div>
			{/if}
		</div>
	</Card.Header>
	<Card.Content class="flex flex-1 flex-col py-4">
		<TagsContainerComponent
			tags={recipe.tags.map((t) => t.name)}
			class="-mx-1 mb-3"
			viewTransitionPrefix={`recipe-tag-${recipe.id}`}
		/>
		<Card.Title class="line-clamp-2 font-fraunces text-xl leading-tight" title={recipe.name}>
			<span style:view-transition-name="recipe-title-{recipe.id}">{recipe.name}</span>
		</Card.Title>
		{#if recipe.description}
			<p class="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-500">
				{recipe.description}
			</p>
		{/if}
	</Card.Content>
	{#if recipe.durationMinutes != null || recipe.portions != null || recipe.course != null}
		<dl
			class={[
				'grid auto-cols-fr grid-flow-col divide-x border-t bg-white',
				recipe.durationMinutes != null &&
					recipe.portions != null &&
					recipe.course != null &&
					'grid-cols-[1fr_0.8fr_1.25fr]'
			]}
		>
			{#if recipe.durationMinutes != null}
				<div class="flex min-w-0 items-center gap-2 px-3 py-3.5">
					<ClockIcon class="size-4 shrink-0 text-orange-600" aria-hidden="true" />
					<div class="min-w-0">
						<dt class="text-[9px] leading-none font-medium tracking-wider text-zinc-400 uppercase">
							Ready in
						</dt>
						<dd class="mt-1 text-xs leading-tight font-semibold">
							{formatDuration(recipe.durationMinutes)}
						</dd>
					</div>
				</div>
			{/if}
			{#if recipe.portions != null}
				<div class="flex min-w-0 items-center gap-2 px-3 py-3.5">
					<UsersIcon class="size-4 shrink-0 text-zinc-500" aria-hidden="true" />
					<div class="min-w-0">
						<dt class="text-[9px] leading-none font-medium tracking-wider text-zinc-400 uppercase">
							Portions
						</dt>
						<dd class="mt-1 text-xs leading-tight font-semibold">{recipe.portions}</dd>
					</div>
				</div>
			{/if}
			{#if recipe.course != null}
				{@const CourseIcon = COURSE_ICONS[recipe.course]}
				<div class="flex min-w-0 items-center gap-2 px-3 py-3.5">
					<CourseIcon class="size-4 shrink-0 text-zinc-500" />
					<div class="min-w-0">
						<dt class="text-[9px] leading-none font-medium tracking-wider text-zinc-400 uppercase">
							Course
						</dt>
						<dd class="mt-1 text-xs leading-tight font-semibold">
							{COURSE_LABELS[recipe.course]}
						</dd>
					</div>
				</div>
			{/if}
		</dl>
	{/if}
</Card.Root>
