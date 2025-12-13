<script lang="ts">
	import { cn } from '$lib/utils';
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as InputGroup from '../ui/input-group/';

	let {
		searchTerm = $bindable(),
		placeholder = 'Search...',
		class: className
	}: { searchTerm: string; placeholder?: string; class?: string } = $props();
</script>

<InputGroup.Root class={cn('border-orange-500/50 bg-orange-500/3', className)}>
	<InputGroup.Input
		class={cn('placeholder:text-orange-500/60 focus-visible:ring-orange-500/20', className)}
		{placeholder}
		bind:value={searchTerm}
	/>
	<InputGroup.Addon>
		<SearchIcon class="stroke-orange-500/60" />
	</InputGroup.Addon>
</InputGroup.Root>
