<script lang="ts" generics="V extends string | number">
	import { Button } from '$lib/components/ui/button/';
	import * as InputGroup from '$lib/components/ui/input-group/';
	import * as Popover from '$lib/components/ui/popover/';
	import { cn } from '$lib/utils';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import XIcon from '@lucide/svelte/icons/x';

	let {
		label,
		options,
		value,
		onchange,
		clearable = true
	}: {
		label: string;
		options: { value: V; label: string }[];
		value: V | null;
		onchange: (value: V | null) => void;
		clearable?: boolean;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedLabel = $derived(options.find((o) => o.value === value)?.label);
	const showClear = $derived(clearable && value != null);

	function select(v: V) {
		onchange(v === value ? null : v);
		open = false;
	}
</script>

<InputGroup.Root
	class={cn(
		'w-auto rounded-full',
		value != null ? 'border-orange-400 bg-orange-50 dark:bg-orange-950' : 'bg-background'
	)}
>
	<Popover.Root bind:open>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					bind:ref={triggerRef}
					variant="ghost"
					size="sm"
					role="combobox"
					aria-expanded={open}
					class={cn(
						'rounded-full shadow-none hover:bg-transparent',
						showClear && 'rounded-r-none',
						value != null && 'text-orange-700 dark:text-orange-300'
					)}
				>
					{label}
					{#if selectedLabel}
						<span class="font-semibold">{selectedLabel}</span>
					{/if}
					<ChevronsUpDownIcon class="opacity-50" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="bg-popover border-border z-50 w-48 rounded-lg border p-2 shadow-md">
			<div class="flex flex-col gap-1">
				{#each options as option (option.value)}
					<button
						type="button"
						onclick={() => select(option.value)}
						class="hover:bg-accent flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm"
					>
						{option.label}
						{#if option.value === value}
							<CheckIcon class="size-4 text-orange-500" />
						{/if}
					</button>
				{/each}
			</div>
		</Popover.Content>
	</Popover.Root>

	{#if showClear}
		<InputGroup.Button
			size="sm"
			onclick={() => onchange(null)}
			class="hover:bg-transparent"
			aria-label="Clear selection"
		>
			<XIcon class="size-3.5 text-orange-700 dark:text-orange-300" />
		</InputGroup.Button>
	{/if}
</InputGroup.Root>
