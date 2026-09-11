<script lang="ts">
	import { getRecipesMetadata } from '$lib/api/recipes.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import RecipeListComponent from '$lib/components/recipes/RecipeListComponent.svelte';
</script>

<svelte:head>
	<title>rezeptly</title>
</svelte:head>

<svelte:boundary>
	{@const recipes = await getRecipesMetadata()}

	<RecipeListComponent {recipes} />

	{#snippet failed(error, retry)}
		<ErrorComponent {error} {retry} />
	{/snippet}
</svelte:boundary>
