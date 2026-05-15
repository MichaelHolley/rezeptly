<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { Instruction } from '$lib/server/types';

	type Props = {
		instr: Instruction;
		stepNumber: number;
		done: boolean;
		onToggle: () => void;
	};

	const { instr, stepNumber, done, onToggle }: Props = $props();
</script>

<div
	class="group flex flex-row gap-4 rounded-xl border p-5 shadow-xs transition-colors duration-150 {done
		? 'border-orange-300 bg-orange-50/40'
		: 'border-zinc-200 bg-white'}"
>
	<div class="shrink-0 pt-0.5">
		<button
			type="button"
			onclick={onToggle}
			aria-pressed={done}
			aria-label={done
				? `Unmark step ${stepNumber} as complete`
				: `Mark step ${stepNumber} as complete`}
			class="flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-150 {done
				? 'bg-orange-500 text-white'
				: 'bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white'}"
		>
			{#if done}
				<CheckIcon class="size-5" />
			{:else}
				{stepNumber}
			{/if}
		</button>
	</div>
	<div class="min-w-0 flex-1">
		{#if instr.heading}
			<h4
				class="mb-2 font-semibold transition-colors duration-150 {done
					? 'text-zinc-500 line-through'
					: ''}"
			>
				{instr.heading}
			</h4>
		{/if}
		<p
			class="whitespace-pre-wrap text-sm transition-colors duration-150 {done
				? 'text-zinc-500'
				: 'text-zinc-700'}"
		>
			{instr.instructions}
		</p>
	</div>
</div>
