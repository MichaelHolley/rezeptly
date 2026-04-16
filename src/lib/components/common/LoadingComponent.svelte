<script lang="ts">
	import { cn } from '$lib/utils';
	import ChefHat from '@lucide/svelte/icons/chef-hat';
	import CookingPot from '@lucide/svelte/icons/cooking-pot';
	import Flame from '@lucide/svelte/icons/flame';
	import HandPlatter from '@lucide/svelte/icons/hand-platter';
	import Microwave from '@lucide/svelte/icons/microwave';
	import Refrigerator from '@lucide/svelte/icons/refrigerator';
	import Soup from '@lucide/svelte/icons/soup';
	import Utensils from '@lucide/svelte/icons/utensils';
	import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed';
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';

	const { class: className }: { class?: string } = $props();

	const icons = [
		CookingPot,
		Utensils,
		UtensilsCrossed,
		ChefHat,
		Soup,
		Microwave,
		HandPlatter,
		Refrigerator,
		Flame
	] as const;
	let iconIndex = $state(0);

	onMount(() => {
		iconIndex = Math.floor(Math.random() * icons.length);

		const interval = setInterval(() => {
			iconIndex = (iconIndex + 1) % icons.length;
		}, 1200);

		return () => clearInterval(interval);
	});

	const CurrentIcon = $derived(icons[iconIndex]);
</script>

<div
	class={cn('relative inline-grid size-10 place-items-center text-zinc-400', className)}
	role="status"
	aria-live="polite"
	aria-label="Loading"
>
	<span class="sr-only">Loading...</span>
	{#key iconIndex}
		<div
			class="absolute inset-0 grid place-items-center icon-shell"
			transition:scale={{ duration: 180, start: 0.85 }}
		>
			<CurrentIcon class="h-full w-full icon" aria-hidden="true" stroke-width="1.8" />
		</div>
	{/key}
</div>

<style>
	.icon-shell {
		animation: pulse 1.2s ease-in-out infinite;
	}

	.icon {
		transform-origin: center;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(0.96);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.04);
			opacity: 1;
		}
	}
</style>
