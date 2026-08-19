<script lang="ts">
	import { setRecipePublished } from '$lib/api/recipes.remote';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { reportError } from '$lib/shared/toast';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import SendIcon from '@lucide/svelte/icons/send';

	const { recipeId, publishedAt }: { recipeId: number; publishedAt: Date | null } = $props();

	const isDraft = $derived(publishedAt === null);

	const togglePublished = async () => {
		try {
			await setRecipePublished({ recipeId, published: isDraft });
		} catch (error) {
			reportError(error);
		}
	};
</script>

{#if PermissionsStore.canEdit}
	<Button
		variant={isDraft ? 'default' : 'outline'}
		class={isDraft
			? 'bg-draft text-draft-foreground hover:bg-draft/90'
			: 'border-draft/30 text-draft hover:bg-draft/10 hover:text-draft'}
		title={isDraft ? 'Publish this recipe' : 'Unpublish this recipe'}
		disabled={!!setRecipePublished.pending}
		onclick={togglePublished}
	>
		{#if !!setRecipePublished.pending}
			<LoadingComponent class="size-4" />
		{:else if isDraft}
			<SendIcon />
		{:else}
			<EyeOffIcon />
		{/if}
		{isDraft ? 'Publish' : 'Unpublish'}
	</Button>
{/if}
