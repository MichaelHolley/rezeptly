<script lang="ts">
	import { page } from '$app/stores';
	import { getUserRoles, logout } from '$lib/api/auth.remote';
	import RezeptlyHeader from '$lib/components/common/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button/';
	import { loggedIn, rolesStore, userCanWrite } from '$lib/store/roles';
	import LoginIcon from '@lucide/svelte/icons/log-in';
	import LogoutIcon from '@lucide/svelte/icons/log-out';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		const roles = await getUserRoles();
		rolesStore.set(roles);
	});

	const logoutUser = async () => {
		const res = await logout();
		rolesStore.reset();
	};
</script>

<nav class="bg-zinc-50 py-2 shadow-sm">
	<div class="container mx-auto px-3 md:px-6">
		<div class="flex flex-row justify-between gap-2">
			<div>
				<RezeptlyHeader />
			</div>
			<div class="flex flex-row items-center gap-3">
				{#if $userCanWrite}
					<Button href="/create" variant="default">+ Create</Button>
				{/if}
				{#if $loggedIn}
					<Button onclick={logoutUser} variant="outline">
						Logout
						<LogoutIcon />
					</Button>
				{:else}
					<Button href="/auth?returnTo={$page.url.pathname}" variant="outline">
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
