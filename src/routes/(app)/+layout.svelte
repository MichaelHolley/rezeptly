<script lang="ts">
	import { page } from '$app/state';
	import { logout } from '$lib/api/auth.remote';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import RezeptlyHeader from '$lib/components/common/navigation/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button/';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import { transformError } from '$lib/utils.js';
	import LoginIcon from '@lucide/svelte/icons/log-in';
	import LogoutIcon from '@lucide/svelte/icons/log-out';
	import { isHttpError, type HttpError } from '@sveltejs/kit';

	let { children, data } = $props();

	$effect(() => {
		PermissionsStore.roles = data.roles || [];
	});

	const logoutUser = async () => {
		PermissionsStore.resetRoles();
		await logout();
	};
</script>

<nav class="bg-zinc-50 py-2 shadow-sm">
	<div class="container mx-auto px-3 md:px-6">
		<div class="flex flex-row justify-between gap-2">
			<div>
				<RezeptlyHeader />
			</div>
			<div class="flex flex-row items-center gap-3">
				{#if PermissionsStore.canEdit}
					<Button href="/create" variant="default">+ Create</Button>
				{/if}
				{#if PermissionsStore.isLoggedIn}
					<Button onclick={logoutUser} variant="outline">
						Logout
						<LogoutIcon />
					</Button>
				{:else}
					<Button href="/auth?returnTo={encodeURIComponent(page.url.pathname)}" variant="outline">
						Login
						<LoginIcon />
					</Button>
				{/if}
			</div>
		</div>
	</div>
</nav>

<div class="container mx-auto my-6 mb-10 px-3 md:px-6">
	<svelte:boundary
		onerror={(err) => {
			if (isHttpError(err)) {
				const error = err as HttpError;
				return { ...error.body };
			}
		}}
	>
		{@render children()}
		{#snippet pending()}
			<div class="flex h-64 items-center justify-center">
				<LoadingComponent class="h-8 w-8" />
			</div>
		{/snippet}

		{#snippet failed(error, reset)}
			{@const errorObj = transformError(error)}
			<div class="flex flex-col items-center justify-center gap-4 py-12 text-center">
				<p class="text-xl text-destructive font-medium">Failed to load recipe</p>
				<p class="text-muted-foreground text-sm">
					{errorObj.message}
				</p>
				<button
					onclick={reset}
					class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm transition-colors"
				>
					Try again
				</button>
			</div>
		{/snippet}
	</svelte:boundary>
</div>
