<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Empty from '$lib/components/ui/empty/';
	import RepeatIcon from '@lucide/svelte/icons/repeat-2';
	import SoupIcon from '@lucide/svelte/icons/soup';
	import { isHttpError } from '@sveltejs/kit';

	const {
		error,
		retry
	}: {
		error: unknown;
		retry?: () => void;
	} = $props();

	const parsedError = $derived.by(() => {
		if (isHttpError(error)) {
			return {
				status: error.status,
				message: error.body.message,
				code: error.body.code
			};
		}

		return {
			code: 'UNHANDLED_ERROR',
			message: error instanceof Error ? error.message : 'An unknown error occurred'
		};
	});
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon" class="size-16">
			<SoupIcon class="size-12 stroke-neutral-400" />
		</Empty.Media>
		<Empty.Title class="text-5xl">
			<p class="text-4xl">Oops!</p>
		</Empty.Title>
		<Empty.Description class="mt-1 text-2xl">{parsedError.message}</Empty.Description>
	</Empty.Header>
	{#if retry}
		<Empty.Content>
			<Button onclick={retry}><RepeatIcon />Retry</Button>
		</Empty.Content>
	{/if}
</Empty.Root>
