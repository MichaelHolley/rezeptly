<script lang="ts">
	import { getDraftRecipesMetadata } from '$lib/api/recipes.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import RecipeListComponent from '$lib/components/recipes/RecipeListComponent.svelte';
</script>

<svelte:head>
	<title>rezeptly | Drafts</title>
</svelte:head>

<BreadcrumbComponent breadcrumbs={[{ name: 'Drafts', href: '/drafts' }]} />

<svelte:boundary>
	{@const recipes = await getDraftRecipesMetadata()}

	<RecipeListComponent {recipes} />

	{#snippet pending()}
		<div class="flex h-64 items-center justify-center">
			<LoadingComponent class="h-8 w-8" />
		</div>
	{/snippet}

	{#snippet failed(error, retry)}
		<ErrorComponent {error} {retry} />
	{/snippet}
</svelte:boundary>
