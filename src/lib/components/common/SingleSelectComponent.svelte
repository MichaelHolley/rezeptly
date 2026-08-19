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
		clearable = true,
		hideLabel = false
	}: {
		label: string;
		options: { value: V; label: string; group?: string }[];
		value: V | null;
		onchange: (value: V | null) => void;
		clearable?: boolean;
		hideLabel?: boolean;
	} = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedLabel = $derived(options.find((o) => o.value === value)?.label);
	const clearableHasValue = $derived(clearable && value != null);

	const optionGroups = $derived.by(() => {
		const groups: { group: string; groupOptions: typeof options }[] = [];
		for (const option of options) {
			const group = option.group ?? '';
			const existing = groups.find((g) => g.group === group);
			if (existing) {
				existing.groupOptions.push(option);
			} else {
				groups.push({ group, groupOptions: [option] });
			}
		}
		return groups;
	});

	function select(v: V) {
		onchange(v === value ? null : v);
		open = false;
	}
</script>

<InputGroup.Root class={cn('w-auto rounded-full')}>
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
					aria-label={hideLabel ? label : undefined}
					class={cn('rounded-full shadow-none hover:bg-transparent')}
				>
					{#if !hideLabel}
						{label}
					{/if}
					{#if selectedLabel}
						<span class="font-semibold">{selectedLabel}</span>
					{/if}
					<ChevronsUpDownIcon class="opacity-50" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content
			class="bg-popover border-border z-50 max-h-64 w-48 overflow-y-auto rounded-lg border p-2 shadow-md"
		>
			<div class="flex flex-col gap-1">
				{#each optionGroups as { group, groupOptions } (group)}
					{#if group}
						<span class="px-2 pt-1 text-xs font-semibold text-zinc-500">{group}</span>
					{/if}
					{#each groupOptions as option (option.value)}
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
				{/each}
			</div>
		</Popover.Content>
	</Popover.Root>

	{#if clearableHasValue}
		<InputGroup.Button
			size="sm"
			onclick={() => onchange(null)}
			class="hover:bg-transparent -ml-3"
			aria-label="Clear selection"
		>
			<XIcon class="size-3.5 " />
		</InputGroup.Button>
	{/if}
</InputGroup.Root>
