<script lang="ts">
	import { enhance } from '$app/forms';
	import { getRecipeById } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/BreadcrumbComponent.svelte';
	import IngredientsListComponent from '$lib/components/ingredients/IngredientsList.svelte';
	import IngredientsSheet from '$lib/components/ingredients/IngredientsSheet.svelte';
	import InstructionsFormComponent, {
		type Step
	} from '$lib/components/instructions/InstructionsForm.svelte';
	import RecipeDetails from '$lib/components/recipes/RecipeDetailsComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { RecipeWithDetails } from '$lib/server/types';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import PenIcon from '@lucide/svelte/icons/pen';
	import XIcon from '@lucide/svelte/icons/x';
	import type { SubmitFunction } from '@sveltejs/kit';

	const { params } = $props();

	const recipe = $derived(await getRecipeById(Number(params.id)));

	let instructionFormSteps = $state<Step[]>([]);
	let showInstructionsForm = $state(false);

	const toggleEditInstructions = () => {
		showInstructionsForm = !showInstructionsForm;

		if (showInstructionsForm && !!recipe) {
			updateInstructionFormSteps(recipe);
		}
	};

	const instructionsSubmitHandler: SubmitFunction = () => {
		return async ({ update }) => {
			showInstructionsForm = false;
			await update();
		};
	};

	const updateInstructionFormSteps = (r: RecipeWithDetails) => {
		instructionFormSteps =
			r.instructions.map((i) => ({
				heading: i.heading,
				description: i.instructions
			})) ?? [];
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
				<IngredientsSheet ingredients={recipe.ingredients} recipeId={Number(params.id)} />
			</div>
			<IngredientsListComponent ingredients={recipe.ingredients} />
		</div>
		<div>
			<div class="flex flex-row gap-1 pb-2">
				<h3>Instructions</h3>
				{#if PermissionsStore.canEdit()}
					<Button variant="ghost" onclick={toggleEditInstructions}>
						{#if showInstructionsForm}
							<XIcon />
						{:else}
							<PenIcon />
						{/if}
					</Button>
				{/if}
			</div>
			{#if showInstructionsForm}
				<form method="POST" action="?/updateInstructions" use:enhance={instructionsSubmitHandler}>
					<InstructionsFormComponent bind:steps={instructionFormSteps} />
				</form>
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
			<IngredientsSheet ingredients={recipe.ingredients} recipeId={Number(params.id)} />
		</div>
		<IngredientsListComponent ingredients={recipe.ingredients} />
	</div>
</div>
