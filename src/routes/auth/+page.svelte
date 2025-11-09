<script lang="ts">
	import { enhance } from '$app/forms';
	import RezeptlyHeader from '$lib/components/common/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { rolesStore } from '$lib/store/roles';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import LoginIcon from '@lucide/svelte/icons/log-in';
	import { onMount } from 'svelte';
	import type { ActionData } from './$types';

	const { form } = $props<{ form: ActionData }>();

	onMount(() => {
		rolesStore.current = [];
	});
</script>

<div class="mx-auto mt-5 max-w-sm">
	<div class="flex flex-row justify-center">
		<RezeptlyHeader />
	</div>
	<form method="POST" class="mt-6 flex flex-col gap-4" use:enhance>
		<Input type="password" name="password" placeholder="Password" />
		{#if form?.message}
			<p class="text-center text-red-500">{form.message}</p>
		{/if}
		<div class="flex flex-row justify-center gap-2">
			<Button href="/"><ChevronLeft />Back</Button>
			<Button type="submit"><LoginIcon />Login</Button>
		</div>
	</form>
</div>
