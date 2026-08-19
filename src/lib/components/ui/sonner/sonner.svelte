<script lang="ts" module>
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';
</script>

<script lang="ts">
	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	theme="light"
	class="toaster group"
	style="--normal-bg: var(--popover); --normal-text: var(--popover-foreground); --normal-border: var(--border); --success-bg: var(--popover); --success-text: var(--popover-foreground); --success-border: var(--border); --error-bg: var(--popover); --error-text: var(--popover-foreground); --error-border: var(--border);"
	{...restProps}
/>
