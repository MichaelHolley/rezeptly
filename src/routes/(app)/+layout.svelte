<script lang="ts">
	import { page } from '$app/state';
	import { getUserRoles, logout } from '$lib/api/auth.remote';
	import { getAvailableTags } from '$lib/api/recipes.remote';
	import RezeptlyHeader from '$lib/components/common/navigation/RezeptlyHeaderComponent.svelte';
	import { Button } from '$lib/components/ui/button/';
	import { Separator } from '$lib/components/ui/separator/';
	import * as Sheet from '$lib/components/ui/sheet/';
	import { reportError } from '$lib/shared/toast';
	import { AvailableTagsStore } from '$lib/store/available-tags.svelte.js';
	import { PermissionsStore } from '$lib/store/roles.svelte';
	import type { Icon as IconType } from '@lucide/svelte';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import ImageIcon from '@lucide/svelte/icons/image-plus';
	import LoginIcon from '@lucide/svelte/icons/log-in';
	import LogoutIcon from '@lucide/svelte/icons/log-out';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TagIcon from '@lucide/svelte/icons/tag';

	let { children, data } = $props();
	const availableTags = $derived(getAvailableTags());
	const userRoles = $derived(getUserRoles());

	let menuOpen = $state(false);

	$effect(() => {
		PermissionsStore.roles = userRoles.current ?? data.roles;
	});

	$effect(() => {
		AvailableTagsStore.tags = availableTags.current || [];
	});

	type NavLink = { href: string; label: string; icon: typeof IconType };

	const adminLinks = $derived<NavLink[]>([
		{ href: '/drafts', label: 'Drafts', icon: FileTextIcon },
		{ href: '/tags', label: 'Tags', icon: TagIcon },
		...(data.features.imageImport ? [{ href: '/import', label: 'Import', icon: ImageIcon }] : [])
	]);

	const isActive = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

	const logoutUser = async () => {
		menuOpen = false;
		try {
			await logout();
			PermissionsStore.resetRoles();
		} catch (error) {
			reportError(error);
		}
	};
</script>

<nav class="sticky top-0 z-40 border-b border-zinc-200/80 bg-zinc-50/90 backdrop-blur">
	<div class="container mx-auto px-3 md:px-6">
		<div class="flex h-14 flex-row items-center justify-between gap-2">
			<RezeptlyHeader />

			<!-- Desktop -->
			<div class="hidden items-center gap-1 md:flex">
				{#if PermissionsStore.canEdit}
					<div class="flex items-center gap-0.5 rounded-full bg-zinc-100/80 p-1">
						{#each adminLinks as link (link.href)}
							{@const Icon = link.icon}
							<Button
								href={link.href}
								variant="ghost"
								size="sm"
								class={isActive(link.href)
									? 'rounded-full bg-white text-orange-600 shadow-sm hover:bg-white hover:text-orange-600'
									: 'rounded-full text-zinc-600 hover:bg-white/70 hover:text-zinc-900'}
							>
								<Icon />
								{link.label}
							</Button>
						{/each}
					</div>
					<Button href="/create" variant="default" class="ml-1 bg-orange-500 hover:bg-orange-600">
						<PlusIcon />
						Create
					</Button>
					<Separator orientation="vertical" class="mx-2 !h-6" />
				{/if}
				{#if PermissionsStore.isLoggedIn}
					<Button onclick={logoutUser} variant="ghost" size="sm" class="text-zinc-600">
						Logout
						<LogoutIcon />
					</Button>
				{:else}
					<Button
						href="/auth?returnTo={encodeURIComponent(page.url.pathname)}"
						variant="outline"
						size="sm"
					>
						Login
						<LoginIcon />
					</Button>
				{/if}
			</div>

			<!-- Mobile -->
			<div class="flex items-center gap-2 md:hidden">
				{#if PermissionsStore.canEdit}
					<Button
						href="/create"
						variant="default"
						size="sm"
						class="bg-orange-500 hover:bg-orange-600"
					>
						<PlusIcon />
						Create
					</Button>
				{/if}
				<Sheet.Root bind:open={menuOpen}>
					<Sheet.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="icon" aria-label="Open menu">
								<MenuIcon />
							</Button>
						{/snippet}
					</Sheet.Trigger>
					<Sheet.Content side="right" class="w-72">
						<Sheet.Header>
							<Sheet.Title>Menu</Sheet.Title>
						</Sheet.Header>
						<nav class="flex flex-col gap-1 px-4">
							{#if PermissionsStore.canEdit}
								{#each adminLinks as link (link.href)}
									{@const Icon = link.icon}
									<Button
										href={link.href}
										variant="ghost"
										onclick={() => (menuOpen = false)}
										class={isActive(link.href)
											? 'justify-start gap-3 bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-600'
											: 'justify-start gap-3 text-zinc-700'}
									>
										<Icon />
										{link.label}
									</Button>
								{/each}
							{/if}
						</nav>
						<Sheet.Footer>
							{#if PermissionsStore.isLoggedIn}
								<Button onclick={logoutUser} variant="outline" class="justify-start gap-3">
									<LogoutIcon />
									Logout
								</Button>
							{:else}
								<Button
									href="/auth?returnTo={encodeURIComponent(page.url.pathname)}"
									variant="outline"
									onclick={() => (menuOpen = false)}
									class="justify-start gap-3"
								>
									<LoginIcon />
									Login
								</Button>
							{/if}
						</Sheet.Footer>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		</div>
	</div>
</nav>

<div class="container mx-auto my-6 mb-10 px-3 md:px-6">
	{@render children()}
</div>
