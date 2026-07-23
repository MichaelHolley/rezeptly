<script lang="ts">
	import { Button, type ButtonSize, type ButtonVariant } from '$lib/components/ui/button';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';

	type Props = {
		value: string;
		label?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
	};

	const {
		value,
		label = 'Copy',
		variant = 'outline',
		size = 'icon',
		class: className
	}: Props = $props();

	let copied = $state(false);
	let resetTimeout: ReturnType<typeof setTimeout>;

	const copy = async () => {
		await navigator.clipboard.writeText(value);
		copied = true;
		clearTimeout(resetTimeout);
		resetTimeout = setTimeout(() => (copied = false), 2000);
	};
</script>

<Button {variant} {size} class={className} onclick={copy} aria-label={label}>
	{#if copied}
		<CheckIcon />
	{:else}
		<CopyIcon />
	{/if}
</Button>
