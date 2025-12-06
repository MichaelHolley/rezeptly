<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/';
	import BugIcon from '@lucide/svelte/icons/bug';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<BugIcon class="text-neutral-300" />
		</Empty.Media>
		<Empty.Description class="text-neutral-300">Preview broken</Empty.Description>
	</Empty.Header>
</Empty.Root>
