<script lang="ts">
	import { getRecipeById } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/BreadcrumbComponent.svelte';
	import IngredientsListComponent from '$lib/components/ingredients/IngredientsList.svelte';
	import IngredientsSheet from '$lib/components/ingredients/IngredientsSheet.svelte';
	import InstructionsFormComponent from '$lib/components/instructions/InstructionsForm.svelte';
	import RecipeDetails from '$lib/components/recipes/RecipeDetailsComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import PenIcon from '@lucide/svelte/icons/pen';
	import XIcon from '@lucide/svelte/icons/x';

	const { params } = $props();

	const recipe = $derived(await getRecipeById(Number(params.id)));

	let showInstructionsForm = $state(false);

	const toggleEditInstructions = () => {
		showInstructionsForm = !showInstructionsForm;
	};

	const getStepOrderByIndex = (index: number) => {
		if (!recipe) {
			return 0;
		}

		let order = 1;
		for (let i = 0; i < index; i++) {
			if (recipe.instructions[i].heading) {
				order++;
			}
		}

		return order;
	};
</script>

<svelte:head>
	<title>Rezeptly | {recipe.name}</title>
</svelte:head>

<BreadcrumbComponent breadcrumbs={[{ name: recipe.name, href: `/${recipe.id}` }]} />

<RecipeDetails {recipe} />

<div class="flex flex-row items-start justify-between gap-12">
	<div class="grow">
		<div class="mb-8 block md:hidden">
			<div class="flex flex-row gap-1 pb-2">
				<h3>Ingredients</h3>
				{#if PermissionsStore.canEdit}
					<IngredientsSheet ingredients={recipe.ingredients} recipeId={recipe.id} />
				{/if}
			</div>
			<IngredientsListComponent ingredients={recipe.ingredients} />
		</div>
		<div>
			<div class="flex flex-row gap-1 pb-2">
				<h3>Instructions</h3>
				{#if PermissionsStore.canEdit}
					<Button
						variant="ghost"
						onclick={toggleEditInstructions}
						title={showInstructionsForm ? 'Cancel editing instructions' : 'Edit instructions'}
					>
						{#if showInstructionsForm}
							<XIcon />
						{:else}
							<PenIcon />
						{/if}
					</Button>
				{/if}
			</div>
			{#if showInstructionsForm}
				<InstructionsFormComponent {recipe} onSave={() => (showInstructionsForm = false)} />
			{:else}
				<div class="flex flex-col gap-4">
					{#each recipe.instructions as instr, i}
						<div>
							{#if instr.heading}
								<h4>{getStepOrderByIndex(i)}. {instr.heading}</h4>
							{/if}
							<p class="whitespace-pre-wrap">{instr.instructions}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	<div class="hidden md:block">
		<div class="flex flex-row gap-1 pb-2">
			<h3>Ingredients</h3>
			{#if PermissionsStore.canEdit}
				<IngredientsSheet ingredients={recipe.ingredients} recipeId={recipe.id} />
			{/if}
		</div>
		<IngredientsListComponent ingredients={recipe.ingredients} />
	</div>
</div>

{#if recipe.imageUrl}
	<div class="mt-12 flex flex-row gap-4">
		<a href={recipe.imageUrl} target="_blank" rel="noopener noreferrer">
			<img src={recipe.imageUrl} alt={`Image for ${recipe.name}`} class="h-52 rounded-sm" />
		</a>
	</div>
{/if}
