<script lang="ts">
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import { page } from '$app/state';
</script>

<ErrorComponent error={page.error} status={page.status} />
