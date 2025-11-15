<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { cn } from '$lib/utils';

	let {
		placeholder = 'Search...',
		class: className,
		searchTerm = $bindable()
	}: { searchTerm: string; placeholder?: string; class?: string } = $props();
</script>

<Input
	data-slot="search-bar"
	class={cn(
		'border-orange-500/50 bg-orange-500/2',
		'placeholder:text-orange-500/60 focus-visible:ring-orange-500/20',
		className
	)}
	{placeholder}
	bind:value={searchTerm}
/>
