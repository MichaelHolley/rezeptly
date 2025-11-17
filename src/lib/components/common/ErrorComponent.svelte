<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty/';
	import OrigamiIcon from '@lucide/svelte/icons/origami';
	import RepeatIcon from '@lucide/svelte/icons/repeat-2';

	const {
		message,
		onRetry
	}: {
		message: string;
		onRetry?: () => void;
	} = $props();
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<OrigamiIcon />
		</Empty.Media>
		<Empty.Title>ooops...</Empty.Title>
		<Empty.Description>Reason: {message}</Empty.Description>
	</Empty.Header>
	{#if onRetry}
		<Empty.Content>
			<Button onclick={onRetry}><RepeatIcon />Retry</Button>
		</Empty.Content>
	{/if}
</Empty.Root>
