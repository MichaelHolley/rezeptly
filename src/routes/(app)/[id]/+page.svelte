<script lang="ts">
	import { enhance } from '$app/forms';
	import BreadcrumbComponent from '$lib/components/common/BreadcrumbComponent.svelte';
	import IngredientsListComponent from '$lib/components/ingredients/IngredientsList.svelte';
	import IngredientsSheet from '$lib/components/ingredients/IngredientsSheet.svelte';
	import InstructionsFormComponent, {
		type Step
	} from '$lib/components/instructions/InstructionsForm.svelte';
	import DeleteRecipeConfirmationModal from '$lib/components/recipes/DeleteRecipeConfirmationModal.svelte';
	import { Button } from '$lib/components/ui/button';
	import PenIcon from '@lucide/svelte/icons/pen';
	import XIcon from '@lucide/svelte/icons/x';
	import type { SubmitFunction } from '@sveltejs/kit';

	const { data } = $props();

	let instructionFormSteps = $state<Step[]>([]);
	let showInstructionsForm = $state(false);

	const toggleEditInstructions = () => {
		showInstructionsForm = !showInstructionsForm;

		if (showInstructionsForm) {
			updateInstructionFormSteps();
		}
	};

	const instructionsSubmitHandler: SubmitFunction = () => {
		return async ({ update }) => {
			showInstructionsForm = false;
			update();
		};
	};

	const updateInstructionFormSteps = () => {
		instructionFormSteps = data.recipe.instructions.map((i) => ({
			heading: i.heading,
			description: i.instructions
		}));
	};
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
					{#each data.recipe.instructions as instr, i}
						<div>
							{#if instr.heading}
								<h4>{i + 1}. {instr.heading}</h4>
							{/if}
							<p class="whitespace-pre-wrap">{instr.instructions}</p>
						</div>
					{/each}
				</div>
			{/if}
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
