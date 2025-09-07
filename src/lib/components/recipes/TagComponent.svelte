<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	const { tag, onClick, active } = $props<{
		tag: string;
		onClick?: () => void;
		active?: boolean;
	}>();
</script>

{#if active}
	<Badge class={onClick && 'hover:cursor-pointer'} onclick={onClick}>
		{tag}
	</Badge>
{:else}
	<Badge variant="secondary" class={onClick && 'hover:cursor-pointer'} onclick={onClick}>
		{tag}
	</Badge>
{/if}
