<script lang="ts">
	import { page } from '$app/state';
	import { login } from '$lib/api/auth.remote';
	import RezeptlyHeader from '$lib/components/common/navigation/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import LoginIcon from '@lucide/svelte/icons/log-in';
	import type { HttpError } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	onMount(() => {
		PermissionsStore.resetRoles();
	});

	const returnTo = page.url.searchParams.get('returnTo') || '/';

	let errorMessage = $state<string | undefined>();
</script>

<div class="mx-auto mt-5 max-w-sm">
	<div class="flex flex-row justify-center">
		<RezeptlyHeader />
	</div>
	<form
		{...login.enhance(async ({ submit, form }) => {
			try {
				errorMessage = undefined;
				await submit();
				form.reset();
			} catch (error) {
				errorMessage = (error as HttpError).body.message;
			}
		})}
		class="mt-6 flex flex-col gap-4"
	>
		<input {...login.fields.returnTo.as('hidden', returnTo)} />
		<Input
			placeholder="Password"
			{...login.fields.password.as('password')}
			disabled={!!login.pending}
		/>
		{#if errorMessage}
			<p class="text-center text-red-500 text-sm">{errorMessage}</p>
		{/if}
		<div class="flex flex-row justify-center gap-2">
			<Button href="/" variant="outline"><ChevronLeft />Back</Button>
			<Button type="submit" disabled={!!login.pending}><LoginIcon />Login</Button>
		</div>
	</form>
</div>
