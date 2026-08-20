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
	<ellipse cx="24" cy="33" rx="16" ry="7" />
	<ellipse cx="24" cy="33" rx="10" ry="4" />
	<circle cx="16" cy="21" r="2.5" />
	<circle cx="24" cy="18" r="2.5" />
	<circle cx="32" cy="21" r="2.5" />
	<path d="M16 23.5v6" />
	<path d="M24 20.5v9" />
	<path d="M32 23.5v6" />
</svg>
