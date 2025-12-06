<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/';
	import OrigamiIcon from '@lucide/svelte/icons/origami';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<OrigamiIcon class="text-neutral-300" />
		</Empty.Media>
		<Empty.Description class="text-neutral-300">No preview</Empty.Description>
	</Empty.Header>
</Empty.Root>
