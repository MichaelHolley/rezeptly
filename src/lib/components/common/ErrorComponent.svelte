<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty/';
	import RepeatIcon from '@lucide/svelte/icons/repeat-2';
	import SoupIcon from '@lucide/svelte/icons/soup';

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
			<SoupIcon />
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
