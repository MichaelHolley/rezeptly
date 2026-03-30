<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/';
	import BugIcon from '@lucide/svelte/icons/bug';
	import SoupIcon from '@lucide/svelte/icons/soup';

	const { variant = 'empty' }: { variant?: 'broken' | 'empty' } = $props();

	const Icon = $derived(variant === 'broken' ? BugIcon : SoupIcon);
	const label = $derived(variant === 'broken' ? 'Preview broken' : 'No preview');
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<Icon class="text-zinc-300" />
		</Empty.Media>
		<Empty.Description class="text-zinc-300">{label}</Empty.Description>
	</Empty.Header>
</Empty.Root>
