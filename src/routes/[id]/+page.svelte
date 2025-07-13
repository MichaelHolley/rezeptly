<script lang="ts">
	import BreadcrumbComponent from '$lib/components/common/BreadcrumbComponent.svelte';
	import IngredientsListComponent from '$lib/components/ingredients/IngredientsList.svelte';
	import IngredientsSheet from '$lib/components/ingredients/IngredientsSheet.svelte';
	import InstructionsFormComponent, {
		type Step
	} from '$lib/components/instructions/InstructionsForm.svelte';
	import DeleteRecipeConfirmationModal from '$lib/components/recipes/DeleteRecipeConfirmationModal.svelte';
	import { Button } from '$lib/components/ui/button';
	import PenIcon from '@lucide/svelte/icons/pen';

	const { data } = $props();

	const instructions = $state<Step[]>([
		{ heading: 'Bierchen', description: 'Jetzt ein lecker Bierchen öffnen' },
		{ heading: 'Noch ein Bierchen', description: 'Was ist besser als ein Bierchen? Richtig! Zwei!' }
	]);
</script>

<BreadcrumbComponent breadcrumbs={[{ name: data.recipe.name, href: `/${data.recipe.id}` }]} />

<div class="flex flex-row justify-between">
	<h2>{data.recipe.name}</h2>
	<DeleteRecipeConfirmationModal />
</div>

<p class="mt-1 text-xs text-zinc-400">
	Created: {data.recipe.createdAt?.toLocaleDateString(undefined, { dateStyle: 'long' })}
</p>

<p class="mt-6 mb-8 text-base font-light text-zinc-500">{data.recipe.description}</p>

<div class="flex flex-row items-start justify-between gap-12">
	<div class="grow">
		<div class="mb-8 block md:hidden">
			{@render ingredientsBlock()}
		</div>

		<div>
			<h3 class="pb-2">Instructions</h3>
			<InstructionsFormComponent steps={instructions} />
		</div>
	</div>
	<div class="hidden md:block">
		{@render ingredientsBlock()}
	</div>
</div>

{#snippet ingredientsBlock()}
	<div class="flex flex-row gap-1 pb-2">
		<h3>Ingredients</h3>
		<IngredientsSheet ingredients={data.recipe.ingredients}>
			<Button variant="ghost" slot="trigger"><PenIcon /></Button>
		</IngredientsSheet>
	</div>
	<IngredientsListComponent ingredients={data.recipe.ingredients} />
{/snippet}
