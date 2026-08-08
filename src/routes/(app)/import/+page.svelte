<script lang="ts">
	import { goto } from '$app/navigation';
	import { importRecipeFromImage } from '$lib/api/recipes.remote';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let isDragOver = $state(false);
	let isImporting = $state(false);
	let errorMessage = $state<string | null>(null);

	const runImport = async (file: File | null | undefined) => {
		if (!file || isImporting) return;

		isImporting = true;
		errorMessage = null;

		try {
			const { slug } = await importRecipeFromImage(file);
			await goto(`/${slug}`);
		} catch (e) {
			errorMessage =
				(e as { body?: { message?: string } })?.body?.message ??
				'Import failed. Please try again with a different image.';
		} finally {
			isImporting = false;
			if (fileInput) fileInput.value = '';
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		isDragOver = false;
		runImport(e.dataTransfer?.files?.[0]);
	};
</script>

<svelte:head>
	<title>rezeptly | Import</title>
</svelte:head>

<BreadcrumbComponent breadcrumbs={[{ name: 'Import Recipe', href: '/import' }]} />

<div class="mt-10 flex flex-col gap-4 md:max-w-[50%]">
	{#if !data.features.imageImport}
		<p class="text-sm text-zinc-500">Recipe import is not configured on this instance.</p>
	{:else}
		<p class="text-sm text-zinc-500">
			Upload a photo of a recipe. It is read once and discarded — the imported recipe is saved as a
			draft for you to review.
		</p>

		<input
			bind:this={fileInput}
			type="file"
			accept="image/jpeg,image/png,image/webp"
			oninput={(e) => runImport(e.currentTarget.files?.[0])}
			class="hidden"
		/>

		<button
			type="button"
			disabled={isImporting}
			onclick={() => fileInput?.click()}
			ondragover={(e) => {
				e.preventDefault();
				isDragOver = true;
			}}
			ondragleave={() => (isDragOver = false)}
			ondrop={handleDrop}
			class="flex w-full flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed py-16 transition-colors disabled:cursor-default {isDragOver
				? 'border-zinc-400 bg-zinc-100'
				: 'border-zinc-300 bg-transparent hover:cursor-pointer hover:bg-zinc-50'}"
		>
			{#if isImporting}
				<LoadingComponent class="h-8 w-8" />
				<span class="text-sm text-zinc-500">Reading the recipe…</span>
			{:else}
				<span class="text-sm text-zinc-500">Import from image</span>
				<span class="text-xs text-zinc-400">Click or drag & drop</span>
			{/if}
		</button>

		{#if errorMessage}
			<p class="text-sm text-red-600">{errorMessage}</p>
		{/if}
	{/if}
</div>
