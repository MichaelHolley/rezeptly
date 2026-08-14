<script lang="ts">
	import type { Component } from 'svelte';

	const {
		icon: Icon,
		label,
		value
	}: {
		icon: Component<{ class?: string }>;
		label: string;
		value: string | number | null;
	} = $props();
</script>

<div class="flex items-center gap-3 rounded-lg border p-3">
	<div class="flex h-9 w-9 items-center justify-center rounded-md bg-orange-100 text-orange-600">
		<Icon class="h-5 w-5" />
	</div>
	<div class="flex flex-col">
		<span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
		<span class="text-sm font-semibold">{value}</span>
	</div>
</div>
