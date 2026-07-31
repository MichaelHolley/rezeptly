<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';

	const { publishedAt, class: className }: { publishedAt: Date | null; class?: string } = $props();
</script>

{#if publishedAt === null}
	<Badge class={cn('border-transparent bg-purple-600 text-white shadow-sm', className)}>Draft</Badge
	>
{/if}
