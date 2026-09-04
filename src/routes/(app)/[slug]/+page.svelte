<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { deleteRecipeImage, getRecipeBySlug, uploadRecipeImage } from '$lib/api/recipes.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import ImagePlaceholderComponent from '$lib/components/common/ImagePlaceholderComponent.svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import IngredientsListComponent from '$lib/components/ingredients/IngredientsList.svelte';
	import IngredientsSheet from '$lib/components/ingredients/IngredientsSheet.svelte';
	import InstructionsFormComponent from '$lib/components/instructions/InstructionsForm.svelte';
	import InstructionStep from '$lib/components/instructions/InstructionStep.svelte';
	import RecipeDetails from '$lib/components/recipes/RecipeDetailsComponent.svelte';
	import RecipeAssistant from '$lib/components/recipes/RecipeAssistant.svelte';
	import { Button } from '$lib/components/ui/button';
	import { reportError } from '$lib/shared/toast';
	import { getUploadAllowedTypes } from '$lib/shared/upload';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import PenIcon from '@lucide/svelte/icons/pen';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import UsersIcon from '@lucide/svelte/icons/users';
	import XIcon from '@lucide/svelte/icons/x';
	import { SvelteSet } from 'svelte/reactivity';

	const { params, data } = $props();

	let fileUploadInput = $state<HTMLInputElement | null>(null);
	let fileUploadFormSubmitButton = $state<HTMLButtonElement | null>(null);
	let showInstructionsForm = $state(false);
	let isImageBroken = $state(false);
	let doneSteps = $state(new Set<number>());
	let isDragOver = $state(false);

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		isDragOver = false;
		const file = e.dataTransfer?.files?.[0];
		if (!file || !fileUploadInput) return;
		const dt = new DataTransfer();
		dt.items.add(file);
		fileUploadInput.files = dt.files;
		fileUploadFormSubmitButton?.click();
	};

	const recipeQuery = $derived(getRecipeBySlug(params.slug));

	const handleImageError = () => {
		isImageBroken = true;
	};

	const handleDeleteImage = async (recipeId: number) => {
		const query = getRecipeBySlug(params.slug);
		const release = query.withOverride((recipe) => ({ ...recipe, imageUrl: null }));
		try {
			await deleteRecipeImage(recipeId);
		} catch (error) {
			reportError(error);
		} finally {
			release();
		}
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

	const handleAssistantApplied = async (result: { recipe: { slug: string } }) => {
		await getRecipeBySlug(result.recipe.slug).refresh();
		if (result.recipe.slug !== params.slug) {
			await goto(`/${result.recipe.slug}`, { replaceState: true, keepFocus: true, noScroll: true });
		}
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
				<div class="flex flex-row items-center gap-2 pb-4">
					<h3 class="font-fraunces text-3xl font-semibold tracking-tight">Ingredients</h3>
					{#if recipe.portions != null}
						<span class="flex items-center gap-1 text-sm text-zinc-500">
							<UsersIcon class="h-4 w-4" />{recipe.portions}
						</span>
					{/if}
					{#if PermissionsStore.canEdit}
						<IngredientsSheet
							ingredients={recipe.ingredients}
							recipeId={recipe.id}
							recipeSlug={recipe.slug}
							portions={recipe.portions}
						/>
					{/if}
				</div>
				<IngredientsListComponent ingredients={recipe.ingredients} />
			</div>
			<div>
				<div class="flex flex-row items-center gap-1 pb-4">
					<h3 class="font-fraunces text-3xl font-semibold tracking-tight">Instructions</h3>
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
			<div class="flex flex-row items-center gap-2 pb-2">
				<h3 class="font-fraunces text-3xl font-semibold tracking-tight">Ingredients</h3>
				{#if recipe.portions != null}
					<span class="flex items-center gap-1 text-sm text-zinc-500">
						<UsersIcon class="h-4 w-4" />{recipe.portions}
					</span>
				{/if}
				{#if PermissionsStore.canEdit}
					<IngredientsSheet
						ingredients={recipe.ingredients}
						recipeId={recipe.id}
						recipeSlug={recipe.slug}
						portions={recipe.portions}
					/>
				{/if}
			</div>
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
								await handleDeleteImage(recipe.id);
							}}
							disabled={!!deleteRecipeImage.pending}
						>
							<div class="rounded bg-zinc-200/70 p-1">
								{#if !!deleteRecipeImage.pending}
									<Spinner class="size-4" />
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
								await handleDeleteImage(recipe.id);
							}}
							disabled={!!deleteRecipeImage.pending}
						>
							<div class="rounded bg-zinc-200/70 p-1">
								{#if !!deleteRecipeImage.pending}
									<Spinner class="size-4" />
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
				class="flex size-32 items-center justify-center rounded-sm border-2 border-dashed hover:cursor-pointer transition-colors {isDragOver
					? 'border-zinc-400 bg-zinc-100'
					: 'border-zinc-300 bg-transparent hover:bg-zinc-50'}"
				onclick={() => fileUploadInput?.click()}
				ondragover={(e) => {
					e.preventDefault();
					isDragOver = true;
				}}
				ondragleave={() => {
					isDragOver = false;
				}}
				ondrop={handleDrop}
				disabled={!!uploadRecipeImage.pending}
			>
				{#if !!uploadRecipeImage.pending}
					<Spinner />
				{:else}
					<div class="flex flex-col items-center gap-1">
						<PlusIcon class="size-8 text-zinc-500" />
						<span class="text-sm text-zinc-500">Add image</span>
					</div>
				{/if}
			</button>
			<form
				{...uploadRecipeImage.enhance(async ({ submit }) => {
					try {
						await submit();
					} catch (error) {
						reportError(error);
					}
				})}
				enctype="multipart/form-data"
				class="hidden"
			>
				<input {...uploadRecipeImage.fields.recipeId.as('hidden', recipe.id)} />
				<input
					accept={getUploadAllowedTypes()}
					hidden
					{...uploadRecipeImage.fields.file.as('file')}
					bind:this={fileUploadInput}
					oninput={() => fileUploadFormSubmitButton?.click()}
				/>
				<button type="submit" hidden bind:this={fileUploadFormSubmitButton}>Save</button>
			</form>
		{/if}
	</div>

	{#if data.features.recipeAssistant && PermissionsStore.canEdit && recipe.publishedAt == null}
		{#key recipe.id}
			<RecipeAssistant recipeId={recipe.id} onApplied={handleAssistantApplied} />
		{/key}
	{/if}

	{#snippet pending()}
		<div class="flex h-64 items-center justify-center">
			<Spinner class="h-8 w-8" />
		</div>
	{/snippet}

	{#snippet failed(error, retry)}
		<ErrorComponent {error} {retry} />
	{/snippet}
</svelte:boundary>
