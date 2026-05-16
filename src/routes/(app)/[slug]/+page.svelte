<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { env as publicEnv } from '$env/dynamic/public';
	import { deleteRecipeImage, getRecipeBySlug, uploadRecipeImage } from '$lib/api/recipes.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import ImagePlaceholderComponent from '$lib/components/common/ImagePlaceholderComponent.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import IngredientsListComponent from '$lib/components/ingredients/IngredientsList.svelte';
	import IngredientsSheet from '$lib/components/ingredients/IngredientsSheet.svelte';
	import InstructionsFormComponent from '$lib/components/instructions/InstructionsForm.svelte';
	import InstructionStep from '$lib/components/instructions/InstructionStep.svelte';
	import RecipeDetails from '$lib/components/recipes/RecipeDetailsComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import PenIcon from '@lucide/svelte/icons/pen';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';
	import { SvelteSet } from 'svelte/reactivity';

	const { params } = $props();

	let fileUploadInput = $state<HTMLInputElement | null>(null);
	let fileUploadFormSubmitButton = $state<HTMLButtonElement | null>(null);
	let showInstructionsForm = $state(false);
	let isImageBroken = $state(false);
	let doneSteps = $state(new Set<number>());

	const recipeQuery = $derived(getRecipeBySlug(params.slug));

	const handleImageError = () => {
		isImageBroken = true;
	};

	const toggleEditInstructions = () => {
		showInstructionsForm = !showInstructionsForm;
	};

	beforeNavigate(async ({ cancel }) => {
		if (showInstructionsForm) {
			const r = confirm(
				'You have unsaved changes to the instructions. Are you sure you want to leave this page?'
			);

			if (!r) cancel();
		}
	});

	const toggleStep = (id: number) => {
		const next = new SvelteSet(doneSteps);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		doneSteps = next;
	};
</script>

<svelte:head>
	<title>rezeptly{recipeQuery.current?.name ? ` | ${recipeQuery.current.name}` : ''}</title>
</svelte:head>

<svelte:boundary>
	{@const recipe = await recipeQuery}

	<BreadcrumbComponent breadcrumbs={[{ name: recipe.name, href: `/${recipe.slug}` }]} />

	<RecipeDetails {recipe} />

	<div class="flex flex-row items-start justify-between gap-12">
		<div class="grow">
			<div class="mb-8 block md:hidden">
				<div class="flex flex-row gap-1 pb-2">
					<h3>Ingredients</h3>
					{#if PermissionsStore.canEdit}
						<IngredientsSheet
							ingredients={recipe.ingredients}
							recipeId={recipe.id}
							recipeSlug={recipe.slug}
							portions={recipe.portions}
						/>
					{/if}
				</div>
				{#if recipe.portions != null}
					<p class="pb-2 text-sm text-zinc-500">for {recipe.portions} portions</p>
				{/if}
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
					<div class="flex flex-col gap-3">
						{#each recipe.instructions as instr, i (instr.id)}
							<InstructionStep
								{instr}
								stepNumber={i + 1}
								done={doneSteps.has(instr.id)}
								onToggle={() => toggleStep(instr.id)}
							/>
						{/each}
					</div>
				{/if}
			</div>
		</div>
		<div class="hidden md:block">
			<div class="flex flex-row gap-1 pb-2">
				<h3>Ingredients</h3>
				{#if PermissionsStore.canEdit}
					<IngredientsSheet
						ingredients={recipe.ingredients}
						recipeId={recipe.id}
						recipeSlug={recipe.slug}
						portions={recipe.portions}
					/>
				{/if}
			</div>
			{#if recipe.portions != null}
				<p class="pb-2 text-sm text-zinc-500">for {recipe.portions} portions</p>
			{/if}
			<IngredientsListComponent ingredients={recipe.ingredients} />
		</div>
	</div>

	<div class="mt-12">
		{#if recipe.imageUrl && !isImageBroken}
			<div class="flex flex-row gap-4">
				<a href={recipe.imageUrl} target="_blank" rel="noopener noreferrer" class="relative">
					<img
						src={recipe.imageUrl}
						alt={`Image for ${recipe.name}`}
						class="h-52 rounded-sm shadow-sm"
						onerror={handleImageError}
					/>
					{#if PermissionsStore.canEdit}
						<button
							class="absolute top-2 right-2"
							onclick={async (e) => {
								e.preventDefault();
								await deleteRecipeImage(recipe.id);
							}}
							disabled={!!deleteRecipeImage.pending}
						>
							<div class="rounded bg-zinc-200/70 p-1">
								{#if !!deleteRecipeImage.pending}
									<LoadingComponent class="size-4" />
								{:else}
									<TrashIcon class="stroke-zinc-700 size-4" />
								{/if}
							</div>
						</button>
					{/if}
				</a>
			</div>
		{:else if recipe.imageUrl && isImageBroken}
			<div class="flex flex-row gap-4">
				<div
					class="relative flex size-48 items-center justify-center rounded-sm border bg-zinc-50 shadow-sm"
				>
					<ImagePlaceholderComponent variant="broken" />
					{#if PermissionsStore.canEdit}
						<button
							class="absolute top-2 right-2"
							onclick={async (e) => {
								e.preventDefault();
								await deleteRecipeImage(recipe.id);
							}}
							disabled={!!deleteRecipeImage.pending}
						>
							<div class="rounded bg-zinc-200/70 p-1">
								{#if !!deleteRecipeImage.pending}
									<LoadingComponent class="size-4" />
								{:else}
									<TrashIcon class="stroke-zinc-700 size-4" />
								{/if}
							</div>
						</button>
					{/if}
				</div>
			</div>
		{:else if PermissionsStore.canEdit}
			<button
				class="flex size-32 items-center justify-center rounded-sm border bg-zinc-100 hover:cursor-pointer shadow-xs"
				onclick={() => {
					fileUploadInput?.click();
				}}
				disabled={!!uploadRecipeImage.pending}
			>
				{#if !!uploadRecipeImage.pending}
					<LoadingComponent />
				{:else}
					<PlusIcon class="size-8 text-zinc-500" />
				{/if}
			</button>
			<form {...uploadRecipeImage} enctype="multipart/form-data" class="hidden">
				<input {...uploadRecipeImage.fields.recipeId.as('hidden', recipe.id)} />
				<input
					accept={publicEnv.PUBLIC_UPLOAD_ALLOWED_TYPES}
					hidden
					{...uploadRecipeImage.fields.file.as('file')}
					bind:this={fileUploadInput}
					oninput={() => fileUploadFormSubmitButton?.click()}
				/>
				<button type="submit" hidden bind:this={fileUploadFormSubmitButton}>Save</button>
			</form>
		{/if}
	</div>

	{#snippet pending()}
		<div class="flex h-64 items-center justify-center">
			<LoadingComponent class="h-8 w-8" />
		</div>
	{/snippet}

	{#snippet failed(error, retry)}
		<ErrorComponent {error} {retry} />
	{/snippet}
</svelte:boundary>
