<script lang="ts">
	import { enhance } from '$app/forms';
	import RezeptlyHeader from '$lib/components/common/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import LoginIcon from '@lucide/svelte/icons/log-in';
	import type { ActionData } from './$types';

	const { form } = $props<{ form: ActionData }>();
</script>

<div class="mx-auto mt-5 max-w-sm">
	<div class="flex flex-row justify-center">
		<RezeptlyHeader />
	</div>
	<form method="POST" class="mt-6 flex flex-col gap-4" use:enhance>
		<Input type="password" name="password" placeholder="Password" />
		<div class="flex flex-row justify-center">
			<Button type="submit"><LoginIcon />Login</Button>
		</div>

		{#if form?.message}
			<p class="text-center text-red-500">{form.message}</p>
		{/if}
	</form>
</div>
