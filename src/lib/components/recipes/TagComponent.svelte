<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	const { tag, onClick } = $props<{ tag: string; onClick?: () => void }>();
</script>

<Badge variant="secondary" class={onClick && 'hover:cursor-pointer'} onclick={onClick}>{tag}</Badge>
