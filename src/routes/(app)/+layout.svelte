<script lang="ts">
	import { goto } from '$app/navigation';
	import { getUserRoles, logout } from '$lib/api/auth.remote';
	import RezeptlyHeader from '$lib/components/common/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button/';
	import { rolesStore } from '$lib/store/roles';
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

		if (res.redirect) goto('/auth');
	};
</script>

<nav class="bg-zinc-50 py-2 shadow-sm">
	<div class="container mx-auto px-3 md:px-6">
		<div class="flex flex-row justify-between gap-2">
			<div></div>
			<div>
				<RezeptlyHeader />
			</div>
			<div class="flex flex-row items-center gap-2">
				{#if rolesStore.userCanWrite}
					<Button href="/create" variant="outline">+ Create</Button>
				{/if}
				{#if !rolesStore.loggedIn}
					<Button onclick={logoutUser} variant="outline"><LogoutIcon />Logout</Button>
				{:else}
					<Button href="/auth" variant="outline"><LoginIcon />Login</Button>
				{/if}
			</div>
		</div>
	</div>
</nav>

<div class="container mx-auto my-6 mb-10 px-3 md:px-6">
	{@render children()}
</div>
