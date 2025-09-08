<script lang="ts">
	import LoaderIcon from '@lucide/svelte/icons/loader';

	const { hidden } = $props<{ hidden?: boolean }>();
</script>

<LoaderIcon
	class="animate-spin text-neutral-400 {hidden && 'invisible'}"
	style="animation-duration: 2s;"
/>
