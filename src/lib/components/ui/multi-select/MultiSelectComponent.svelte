<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { cn } from '$lib/utils';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import XIcon from '@lucide/svelte/icons/x';
	import { Checkbox, Popover } from 'bits-ui';

	let {
		label,
		options,
		selected,
		onchange,
		clearable = false
	}: {
		label: string;
		options: { value: string; label: string }[];
		selected: string[];
		onchange: (value: string[]) => void;
		clearable?: boolean;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const showClear = $derived(clearable && selected.length > 0);

	function toggle(value: string) {
		const updated = selected.includes(value)
			? selected.filter((s) => s !== value)
			: [...selected, value];
		onchange(updated);
	}
</script>

<InputGroup.Root
	class={cn(
		'w-auto rounded-full',
		selected.length > 0 ? 'border-orange-400 bg-orange-50 dark:bg-orange-950' : 'bg-background'
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
						selected.length > 0 && 'text-orange-700 dark:text-orange-300'
					)}
				>
					{label}
					{#if selected.length > 0}
						<span class="font-semibold">({selected.length})</span>
					{/if}
					<ChevronsUpDownIcon class="opacity-50" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="bg-popover border-border z-50 w-48 rounded-lg border p-2 shadow-md">
			<div class="flex flex-col gap-1">
				{#each options as option (option.value)}
					<label
						class="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
					>
						<Checkbox.Root
							checked={selected.includes(option.value)}
							onCheckedChange={() => toggle(option.value)}
							class="border-input data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 flex size-4 shrink-0 items-center justify-center rounded border transition-colors"
						>
							{#snippet children({ checked })}
								{#if checked}
									<svg viewBox="0 0 10 8" fill="none" class="size-2.5 text-white">
										<path
											d="M1 4l3 3 5-6"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								{/if}
							{/snippet}
						</Checkbox.Root>
						{option.label}
					</label>
				{/each}
			</div>
		</Popover.Content>
	</Popover.Root>

	{#if showClear}
		<InputGroup.Button size="sm" onclick={() => onchange([])} class="hover:bg-transparent">
			<XIcon class="size-3.5 text-orange-700 dark:text-orange-300" />
		</InputGroup.Button>
	{/if}
</InputGroup.Root>
