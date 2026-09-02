<script lang="ts">
	import { getRecipesMetadata } from '$lib/api/recipes.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import RecipeListComponent from '$lib/components/recipes/RecipeListComponent.svelte';
	import { Spinner } from '$lib/components/ui/spinner';
</script>

<svelte:head>
	<title>rezeptly</title>
</svelte:head>

<svelte:boundary>
	{@const recipes = await getRecipesMetadata()}

	<RecipeListComponent {recipes} />

	{#snippet pending()}
		<div class="flex h-64 items-center justify-center">
			<Spinner class="h-8 w-8" />
		</div>
	{/snippet}

	{#snippet failed(error, retry)}
		<ErrorComponent {error} {retry} />
	{/snippet}
</svelte:boundary>
