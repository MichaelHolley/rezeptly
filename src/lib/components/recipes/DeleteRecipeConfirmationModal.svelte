<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { deleteRecipe } from '$lib/api/recipes.remote';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';

	const { trigger } = $props<{
		trigger: Snippet;
	}>();
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#if trigger}
			{@render trigger()}
		{/if}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure you want to delete this recipe?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete your recipe.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<div class="flex flex-row justify-between gap-2 sm:justify-end">
				<Dialog.Close>
					<Button variant="secondary">
						<XIcon />
						Cancel
					</Button>
				</Dialog.Close>
				<Button
					class="btn btn-error"
					variant="destructive"
					type="submit"
					onclick={async () => {
						try {
							if (!page.params.id) return;
							await deleteRecipe(Number(page.params.id));
							await goto('/', { replaceState: true });
						} catch (e) {
							console.error(e);
						}
					}}
				>
					<TrashIcon />
					Delete
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
