<script lang="ts">
	import { createRecipe } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import SingleSelectComponent from '$lib/components/common/SingleSelectComponent.svelte';
	import CategoryTagInputComponent from '$lib/components/recipes/CategoryTagInputComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { DURATION_BUCKETS, formatDuration } from '$lib/shared/duration';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let typeTags = $state<string[]>([]);
	let cuisineTags = $state<string[]>([]);
	let nutritionTags = $state<string[]>([]);
	let dietTags = $state<string[]>([]);
	let durationMinutes = $state<number | null>(null);
	let importImageName = $state<string | null>(null);
	let importImageInput = $state<HTMLInputElement | null>(null);
	let isImportDragOver = $state(false);

	const handleImportDrop = (e: DragEvent) => {
		e.preventDefault();
		isImportDragOver = false;
		const file = e.dataTransfer?.files?.[0];
		if (!file || !importImageInput) return;
		const dt = new DataTransfer();
		dt.items.add(file);
		importImageInput.files = dt.files;
		importImageName = file.name;
	};

	const durationOptions = DURATION_BUCKETS.map((min) => ({
		value: min,
		label: formatDuration(min)!
	}));
</script>

<svelte:head>
	<title>rezeptly | New</title>
</svelte:head>

<BreadcrumbComponent breadcrumbs={[{ name: 'Create Recipe', href: '/create' }]} />

<form {...createRecipe} enctype="multipart/form-data" class="flex flex-col gap-4">
	<div class="form-group">
		<Label for="name">Name</Label>
		<Input id="name" placeholder="Name" required {...createRecipe.fields.name.as('text')} />
	</div>
	<div class="form-group">
		<Label for="description">Description</Label>
		<Textarea
			id="description"
			placeholder="Short Recipe Description"
			required
			{...createRecipe.fields.description.as('text')}
		/>
	</div>
	<div class="flex flex-row flex-wrap gap-2">
		<SingleSelectComponent
			label="Duration"
			options={durationOptions}
			value={durationMinutes}
			onchange={(v) => (durationMinutes = v)}
		/>
	</div>
	{#if durationMinutes != null}
		<input {...createRecipe.fields.durationMinutes.as('number', durationMinutes)} class="hidden" />
	{/if}
	<CategoryTagInputComponent bind:typeTags bind:cuisineTags bind:nutritionTags bind:dietTags />
	{#each typeTags as tag, i (tag)}
		<input {...createRecipe.fields.tagType[i].as('hidden', tag)} />
	{/each}
	{#each cuisineTags as tag, i (tag)}
		<input {...createRecipe.fields.tagCuisine[i].as('hidden', tag)} />
	{/each}
	{#each nutritionTags as tag, i (tag)}
		<input {...createRecipe.fields.tagNutrition[i].as('hidden', tag)} />
	{/each}
	{#each dietTags as tag, i (tag)}
		<input {...createRecipe.fields.tagDiet[i].as('hidden', tag)} />
	{/each}
	{#if data.features.imageImport}
		<div class="form-group mt-6">
			<input
				bind:this={importImageInput}
				accept="image/jpeg,image/png,image/webp"
				{...createRecipe.fields.importImage.as('file')}
				oninput={(e) => {
					importImageName = e.currentTarget.files?.[0]?.name ?? null;
				}}
				class="hidden"
			/>
			<button
				type="button"
				onclick={() => importImageInput?.click()}
				ondragover={(e) => {
					e.preventDefault();
					isImportDragOver = true;
				}}
				ondragleave={() => {
					isImportDragOver = false;
				}}
				ondrop={handleImportDrop}
				class="flex w-full flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed py-6 transition-colors hover:cursor-pointer {isImportDragOver
					? 'border-zinc-400 bg-zinc-100'
					: 'border-zinc-300 bg-transparent hover:bg-zinc-50'}"
			>
				<span class="text-sm text-zinc-500"
					>{importImageName ?? 'Import from image (optional)'}</span
				>
				<span class="text-xs text-zinc-400">Click or drag & drop</span>
			</button>
		</div>
	{/if}
	<div class="flex flex-row justify-end">
		<Button type="submit" disabled={!!createRecipe.pending}>+ Create</Button>
	</div>
</form>
