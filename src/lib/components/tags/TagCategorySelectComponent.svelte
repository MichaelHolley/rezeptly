<script lang="ts">
	import type { TagCategory } from '$lib/server/types';
	import { TAG_CATEGORY_CONFIG } from '$lib/shared/tags';
	import { cn } from '$lib/utils';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	let {
		value = $bindable('type'),
		class: className,
		...restProps
	}: Omit<HTMLSelectAttributes, 'value'> & { value?: TagCategory; class?: string } = $props();
</script>

<select
	bind:value
	class={cn(
		'border-input bg-background shadow-xs h-9 rounded-md border px-2 text-sm outline-none transition-[color,box-shadow]',
		'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
		className
	)}
	{...restProps}
>
	{#each TAG_CATEGORY_CONFIG as option (option.key)}
		<option value={option.key}>{option.label}</option>
	{/each}
</select>
