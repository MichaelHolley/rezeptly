<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty/';
	import RepeatIcon from '@lucide/svelte/icons/repeat-2';
	import SoupIcon from '@lucide/svelte/icons/soup';

	const {
		error,
		onRetry
	}: {
		error: App.Error;
		onRetry?: () => void;
	} = $props();
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon" class="size-16">
			<SoupIcon class="size-12 stroke-neutral-400" />
		</Empty.Media>
		<Empty.Title class="text-5xl">
			<p class="text-4xl">Oops!</p>
		</Empty.Title>
		<Empty.Description class="mt-1 text-2xl">{error.message}</Empty.Description>
	</Empty.Header>
	{#if onRetry}
		<Empty.Content>
			<Button onclick={onRetry}><RepeatIcon />Retry</Button>
		</Empty.Content>
	{/if}
</Empty.Root>
