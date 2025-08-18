<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';
	import { deleteRecipeById } from '../../../routes/(app)/[id]/page.remote';
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button class="btn btn-error" variant="destructive" type="submit">
			<TrashIcon />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure you want to delete this recipe?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete your recipe.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Dialog.Close>
				<Button variant="secondary">
					<XIcon />
					Cancel {page.params.id}
				</Button>
			</Dialog.Close>
			<Button
				class="btn btn-error"
				variant="destructive"
				type="submit"
				onclick={async () => {
					try {
						if (!page.params.id) return;
						await deleteRecipeById(Number(page.params.id));
						await goto('/', { replaceState: true });
					} catch (e) {
						console.error(e);
					}
				}}
			>
				<TrashIcon />
				Delete
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
