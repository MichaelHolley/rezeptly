<script lang="ts">
	import RezeptlyHeader from '$lib/components/common/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button/';

	let { children } = $props();
</script>

<nav class="bg-zinc-50 py-2 shadow-sm">
	<div class="container mx-auto px-3 md:px-6">
		<div class="flex flex-row justify-between gap-2">
			<div></div>
			<div>
				<RezeptlyHeader />
			</div>
			<div class="flex flex-row items-center">
				<Button href="/create">+ Create</Button>
			</div>
		</div>
	</div>
</nav>
<div class="container mx-auto my-6 px-3 md:px-6">
	{@render children()}
</div>
