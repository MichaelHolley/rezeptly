<script>
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import XIcon from '@lucide/svelte/icons/x';
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
					Cancel
				</Button>
			</Dialog.Close>
			<form method="POST" action="?/delete" use:enhance>
				<Button class="btn btn-error" variant="destructive" type="submit">
					<TrashIcon />
					Delete
				</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
