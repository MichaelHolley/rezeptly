<script lang="ts">
	import { cn } from '$lib/utils';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import * as InputGroup from '../ui/input-group/';

	let {
		searchTerm = $bindable(),
		placeholder = 'Search...',
		class: className
	}: { searchTerm: string; placeholder?: string; class?: string } = $props();
</script>

<InputGroup.Root class={cn('bg-orange-500/3 border-orange-500/50! ring-orange-500/20!', className)}>
	<InputGroup.Input
		bind:value={searchTerm}
		class={cn('placeholder:text-orange-500/60 focus-visible:ring-orange-500/20', className)}
		{placeholder}
	/>
	<InputGroup.Addon>
		<SearchIcon class="stroke-orange-500/60" />
	</InputGroup.Addon>
	<InputGroup.Addon align="inline-end">
		{#if searchTerm}
			<button onclick={() => (searchTerm = '')}>
				<XIcon class="size-4 stroke-orange-500/60" />
			</button>
		{/if}
	</InputGroup.Addon>
</InputGroup.Root>
