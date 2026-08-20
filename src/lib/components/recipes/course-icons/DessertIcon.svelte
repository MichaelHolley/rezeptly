<script lang="ts">
	const { class: className }: { class?: string } = $props();
</script>

<svg
	class={className}
	viewBox="0 0 48 48"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d="M12 27a12 10 0 0 1 24 0" />
	<path d="M13 27l3 15h16l3-15" />
	<path d="M20 28l1 14" />
	<path d="M28 28l-1 14" />
	<circle cx="24" cy="12" r="2.5" />
</svg>
