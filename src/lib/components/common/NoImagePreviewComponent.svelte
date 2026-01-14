<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/';
	import SoupIcon from '@lucide/svelte/icons/soup';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<SoupIcon class="text-zinc-300" />
		</Empty.Media>
		<Empty.Description class="text-zinc-300">No preview</Empty.Description>
	</Empty.Header>
</Empty.Root>
