<script lang="ts">
	import { enhance } from '$app/forms';
	import { getRecipeById } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/BreadcrumbComponent.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import IngredientsListComponent from '$lib/components/ingredients/IngredientsList.svelte';
	import IngredientsSheet from '$lib/components/ingredients/IngredientsSheet.svelte';
	import InstructionsFormComponent, {
		type Step
	} from '$lib/components/instructions/InstructionsForm.svelte';
	import RecipeDetails from '$lib/components/recipes/RecipeDetailsComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { RecipeWithDetails } from '$lib/server/types';
	import PenIcon from '@lucide/svelte/icons/pen';
	import XIcon from '@lucide/svelte/icons/x';
	import type { SubmitFunction } from '@sveltejs/kit';

	const { params } = $props();

	const recipe = getRecipeById(Number(params.id));

	let instructionFormSteps = $state<Step[]>([]);
	let showInstructionsForm = $state(false);

	const toggleEditInstructions = () => {
		showInstructionsForm = !showInstructionsForm;

		if (showInstructionsForm && !!recipe.current) {
			updateInstructionFormSteps(recipe.current);
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
		if (!recipe.current) {
			return 0;
		}

		let order = 1;
		for (let i = 0; i < index; i++) {
			if (recipe.current.instructions[i].heading) {
				order++;
			}
		}

		return order;
	};
</script>

<svelte:head>
	<title>Rezeptly | {recipe.current?.name}</title>
</svelte:head>

{#if recipe.current}
	<BreadcrumbComponent
		breadcrumbs={[{ name: recipe.current.name, href: `/${recipe.current.id}` }]}
	/>

	<RecipeDetails recipe={recipe.current} />

	<div class="flex flex-row items-start justify-between gap-12">
		<div class="grow">
			<div class="mb-8 block md:hidden">
				{@render ingredientsBlock(recipe.current)}
			</div>
			<div>
				<div class="flex flex-row gap-1 pb-2">
					<h3>Instructions</h3>
					<Button variant="ghost" onclick={toggleEditInstructions} slot="trigger">
						{#if showInstructionsForm}
							<XIcon />
						{:else}
							<PenIcon />
						{/if}
					</Button>
				</div>
				{#if showInstructionsForm}
					<form method="POST" action="?/updateInstructions" use:enhance={instructionsSubmitHandler}>
						<InstructionsFormComponent bind:steps={instructionFormSteps} />
					</form>
				{:else}
					<div class="flex flex-col gap-4">
						{#each recipe.current.instructions as instr, i}
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
			{@render ingredientsBlock(recipe.current)}
		</div>
	</div>
{:else if recipe.error}
	<p class="text-red-500">{recipe.error}</p>
{:else}
	<div class="flex flex-col items-center justify-center pt-32">
		<LoadingComponent />
	</div>
{/if}

{#snippet ingredientsBlock(r: RecipeWithDetails)}
	<div class="flex flex-row gap-1 pb-2">
		<h3>Ingredients</h3>
		<IngredientsSheet ingredients={r.ingredients} recipeId={Number(params.id)}>
			<Button variant="ghost" slot="trigger"><PenIcon /></Button>
		</IngredientsSheet>
	</div>
	<IngredientsListComponent ingredients={r.ingredients} />
{/snippet}
