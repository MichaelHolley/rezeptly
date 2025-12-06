<script lang="ts">
	import { PUBLIC_UPLOAD_ALLOWED_TYPES } from '$env/static/public';
	import { deleteRecipeImage, getRecipeById, uploadRecipeImage } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/BreadcrumbComponent.svelte';
	import IngredientsListComponent from '$lib/components/ingredients/IngredientsList.svelte';
	import IngredientsSheet from '$lib/components/ingredients/IngredientsSheet.svelte';
	import InstructionsFormComponent from '$lib/components/instructions/InstructionsForm.svelte';
	import RecipeDetails from '$lib/components/recipes/RecipeDetailsComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import PenIcon from '@lucide/svelte/icons/pen';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
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
					{#each recipe.instructions as instr, i (instr.id)}
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

<div class="mt-12">
	{#if recipe.imageUrl}
		<div class="flex flex-row gap-4">
			<a href={recipe.imageUrl} target="_blank" rel="noopener noreferrer" class="relative">
				<img src={recipe.imageUrl} alt={`Image for ${recipe.name}`} class="h-52 rounded-sm" />
				{#if PermissionsStore.canEdit}
					<button
						class="absolute top-2 right-2"
						onclick={async (e) => {
							e.preventDefault();
							await deleteRecipeImage(recipe.id);
						}}
					>
						<div class="rounded bg-neutral-200 p-1">
							<TrashIcon />
						</div>
					</button>
				{/if}
			</a>
		</div>
	{:else if PermissionsStore.canEdit}
		<button
			class="flex size-52 items-center justify-center rounded-sm border bg-neutral-100 hover:cursor-pointer"
			onclick={() => {
				fileUploadInput?.click();
			}}
		>
			<PlusIcon class="size-8 text-neutral-300" />
		</button>
		<form {...uploadRecipeImage} enctype="multipart/form-data" class="mt-4 flex flex-col gap-2">
			<input {...uploadRecipeImage.fields.recipeId.as('hidden', recipe.id)} />
			<input
				accept={PUBLIC_UPLOAD_ALLOWED_TYPES}
				hidden
				{...uploadRecipeImage.fields.file.as('file')}
				bind:this={fileUploadInput}
				oninput={(e) => {
					console.log(e);
				}}
			/>
			<button type="submit">Save</button>
		</form>
	{/if}
</div>
