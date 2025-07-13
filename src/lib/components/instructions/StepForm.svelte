<script lang="ts">
	import { Button } from '$lib/components/ui/button/';
	import { Input } from '$lib/components/ui/input/';
	import { Textarea } from '$lib/components/ui/textarea/';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	let {
		heading = $bindable(''),
		description = $bindable(''),
		onRemove
	} = $props<{
		heading: string;
		description: string;
		onRemove: () => void;
	}>();
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-row items-center justify-between gap-2">
		<Input
			type="text"
			placeholder="Short, descriptive heading"
			class="grow"
			required
			bind:value={heading}
		/>
		<Button variant="secondary" onclick={onRemove}><TrashIcon /></Button>
	</div>

	<Textarea
		placeholder="Start by describing the step in detail..."
		required
		bind:value={description}
	/>
</div>
