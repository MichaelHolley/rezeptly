<script lang="ts">
	import { page } from '$app/state';
	import { logout } from '$lib/api/auth.remote';
	import RezeptlyHeader from '$lib/components/common/navigation/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button/';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import LoginIcon from '@lucide/svelte/icons/log-in';
	import LogoutIcon from '@lucide/svelte/icons/log-out';

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
	{@render children()}
</div>
