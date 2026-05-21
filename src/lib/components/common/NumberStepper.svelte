<script lang="ts">
	import { Button } from '$lib/components/ui/button/';
	import { Input } from '$lib/components/ui/input/';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let {
		value,
		onchange,
		min = 1,
		max = 99,
		label,
		placeholder,
		id
	}: {
		value: number | null;
		onchange: (value: number | null) => void;
		min?: number;
		max?: number;
		label?: string;
		placeholder?: string;
		id?: string;
	} = $props();

	function clamp(n: number) {
		return Math.min(max, Math.max(min, n));
	}

	function decrement() {
		if (value == null) return;
		const next = value - 1;
		onchange(next < min ? null : clamp(next));
	}

	function increment() {
		if (value == null) {
			onchange(min);
			return;
		}
		if (value >= max) return;
		onchange(clamp(value + 1));
	}

	function handleInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const raw = target.value;
		if (raw === '') {
			onchange(null);
			return;
		}
		const parsed = Number(raw);
		if (!Number.isFinite(parsed)) return;
		onchange(clamp(Math.trunc(parsed)));
	}
</script>

<div class="inline-flex items-center gap-2">
	{#if label}
		<span class="text-sm">{label}</span>
	{/if}
	<div class="inline-flex items-center gap-1">
		<Button
			type="button"
			variant="outline"
			size="icon"
			onclick={decrement}
			disabled={value == null || value <= min}
			aria-label="Decrease"
		>
			<MinusIcon />
		</Button>
		<Input
			{id}
			type="text"
			inputmode="numeric"
			pattern="[0-9]*"
			{placeholder}
			value={value ?? ''}
			oninput={handleInput}
			class="w-16 text-center"
		/>
		<Button
			type="button"
			variant="outline"
			size="icon"
			onclick={increment}
			disabled={value != null && value >= max}
			aria-label="Increase"
		>
			<PlusIcon />
		</Button>
	</div>
</div>
