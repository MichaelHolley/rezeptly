<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/';
	import BugIcon from '@lucide/svelte/icons/bug';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<BugIcon class="text-zinc-300" />
		</Empty.Media>
		<Empty.Description class="text-zinc-300">Preview broken</Empty.Description>
	</Empty.Header>
</Empty.Root>
