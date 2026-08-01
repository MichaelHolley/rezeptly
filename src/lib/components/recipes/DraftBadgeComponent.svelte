<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';

	const { publishedAt, class: className }: { publishedAt: Date | null; class?: string } = $props();
</script>

{#if publishedAt === null}
	<Badge class={cn('bg-draft text-draft-foreground border-transparent shadow-sm', className)}
		>Draft</Badge
	>
{/if}
