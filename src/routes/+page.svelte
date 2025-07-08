<script lang="ts">
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

{#each data.recipes as recipe}
	<div class="my-2 py-4">
		<p class="text-xl font-bold">{recipe.name}</p>
		<p>{recipe.description}</p>
	</div>
{/each}
