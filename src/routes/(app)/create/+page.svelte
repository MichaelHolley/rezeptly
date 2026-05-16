<script lang="ts">
	import { createRecipe } from '$lib/api/recipes.remote';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import SingleSelectComponent from '$lib/components/common/SingleSelectComponent.svelte';
	import CategoryTagInputComponent from '$lib/components/recipes/CategoryTagInputComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import NumberStepper from '$lib/components/ui/NumberStepper.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { DURATION_BUCKETS, formatDuration } from '$lib/shared/duration';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let typeTags = $state<string[]>([]);
	let cuisineTags = $state<string[]>([]);
	let nutritionTags = $state<string[]>([]);
	let dietTags = $state<string[]>([]);
	let durationMinutes = $state<number | null>(null);
	let portions = $state<number | null>(null);
	let importImageName = $state<string | null>(null);
	let importImageInput = $state<HTMLInputElement | null>(null);

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
	<div class="flex flex-row flex-wrap items-center gap-4">
		<SingleSelectComponent
			label="Duration"
			options={durationOptions}
			value={durationMinutes}
			onchange={(v) => (durationMinutes = v)}
		/>
		<NumberStepper
			label="Portions"
			value={portions}
			onchange={(v) => (portions = v)}
			placeholder="—"
		/>
	</div>
	{#if durationMinutes != null}
		<input {...createRecipe.fields.durationMinutes.as('number', durationMinutes)} class="hidden" />
	{/if}
	{#if portions != null}
		<input {...createRecipe.fields.portions.as('number', portions)} class="hidden" />
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
			<Button type="button" variant="outline" onclick={() => importImageInput?.click()}>
				{importImageName ?? 'Import from image (optional)'}
			</Button>
		</div>
	{/if}
	<div class="flex flex-row justify-end">
		<Button type="submit" disabled={!!createRecipe.pending}>+ Create</Button>
	</div>
</form>
