<script lang="ts">
	import { getManagedTags } from '$lib/api/tags.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import CreateTagFormComponent from '$lib/components/tags/CreateTagFormComponent.svelte';
	import TagRowComponent from '$lib/components/tags/TagRowComponent.svelte';
	import * as Card from '$lib/components/ui/card';
	import { TAG_CATEGORY_CONFIG } from '$lib/shared/tags';
</script>

<svelte:head>
	<title>rezeptly | Tags</title>
</svelte:head>

<BreadcrumbComponent breadcrumbs={[{ name: 'Tags', href: '/tags' }]} />

<div class="flex flex-col gap-6">
	<svelte:boundary>
		{@const tags = await getManagedTags()}

		<div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
			{#each TAG_CATEGORY_CONFIG as { key, label } (key)}
				{@const categoryTags = tags.filter((t) => t.category === key)}
				<Card.Root class="gap-3 py-4">
					<Card.Header class="px-4">
						<Card.Title class="font-fraunces text-2xl font-semibold tracking-tight">
							{label}
						</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-3 px-4">
						<CreateTagFormComponent category={key} />
						{#if categoryTags.length === 0}
							<p class="text-sm text-zinc-500">No tags in this category yet.</p>
						{:else}
							<ul>
								{#each categoryTags as tag (tag.id)}
									<TagRowComponent {tag} />
								{/each}
							</ul>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		{#snippet pending()}
			<div class="flex h-64 items-center justify-center">
				<LoadingComponent class="h-8 w-8" />
			</div>
		{/snippet}

		{#snippet failed(error, retry)}
			<ErrorComponent {error} {retry} />
		{/snippet}
	</svelte:boundary>
</div>
