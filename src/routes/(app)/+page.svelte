<script lang="ts">
	import * as Card from '$lib/components/ui/card/';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { getRecipes } from './data.remote';
</script>

<svelte:boundary>
	<div class="my-4 flex flex-row flex-wrap gap-4">
		{#each await getRecipes() as recipe}
			<a href="/{recipe.id}" class="w-full max-w-xs">
				<Card.Root class="group h-full">
					<Card.Header>
						<Card.Title class="truncate">{recipe.name}</Card.Title>
						<Card.Description class="line-clamp-3 pt-1">
							{recipe.description}
						</Card.Description>
						<Card.Action>
							<ArrowRightIcon
								class="h-4 w-4 text-zinc-400 transition-all group-hover:text-zinc-700"
							/>
						</Card.Action>
					</Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>

	{#snippet pending()}
		<div class="text-center text-neutral-400">Loading...</div>
	{/snippet}
</svelte:boundary>
