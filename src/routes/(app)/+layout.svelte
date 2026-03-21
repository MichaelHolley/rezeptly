<script lang="ts">
	import { page } from '$app/state';
	import { logout } from '$lib/api/auth.remote';
	import { getAvailableTags } from '$lib/api/recipes.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import RezeptlyHeader from '$lib/components/common/navigation/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button/';
	import { AvailableTagsStore } from '$lib/store/available-tags.svelte';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import { transformError } from '$lib/utils.js';
	import LoginIcon from '@lucide/svelte/icons/log-in';
	import LogoutIcon from '@lucide/svelte/icons/log-out';

	let { children, data } = $props();
	const availableTags = await getAvailableTags();
	AvailableTagsStore.tags = availableTags;

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
	<svelte:boundary>
		{@render children()}

		{#snippet pending()}
			<div class="flex h-64 items-center justify-center">
				<LoadingComponent class="h-8 w-8" />
			</div>
		{/snippet}

		{#snippet failed(error, reset)}
			{@const errorObj = transformError(error)}
			<ErrorComponent error={errorObj} onRetry={reset} />
		{/snippet}
	</svelte:boundary>
</div>
