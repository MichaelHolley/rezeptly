<script lang="ts">
	import UtensilsIcon from '@lucide/svelte/icons/utensils';
</script>

<a href="/" class="flex flex-row items-center gap-3">
	<div class="p-2 rounded-full bg-orange-500 drop-shadow-md">
		<UtensilsIcon class="size-6 sm:size-8 stroke-3 drop-shadow-sm stroke-neutral-100" />
	</div>
	<h1 class="font-modak hidden pt-2 text-orange-500 text-shadow-md sm:block">rezeptly</h1>
</a>

<style>
	h1 {
		-webkit-text-fill-color: var(--color-neutral-100);
		-webkit-text-stroke: 3px var(--color-orange-500);
	}
</style>
