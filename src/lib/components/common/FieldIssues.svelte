<script lang="ts">
	const { issues }: { issues: { message: string }[] | undefined } = $props();
</script>

{#each issues ?? [] as issue (issue.message)}
	<p role="alert" class="text-destructive text-sm">{issue.message}</p>
{/each}
