<script lang="ts">
	import { getManagedTags } from '$lib/api/tags.remote';
	import ErrorComponent from '$lib/components/common/ErrorComponent.svelte';
	import LoadingComponent from '$lib/components/common/LoadingComponent.svelte';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';
	import CreateTagFormComponent from '$lib/components/tags/CreateTagFormComponent.svelte';
	import TagRowComponent from '$lib/components/tags/TagRowComponent.svelte';
	import { TAG_CATEGORY_CONFIG } from '$lib/shared/tags';
</script>

<svelte:head>
	<title>rezeptly | Tags</title>
</svelte:head>

<BreadcrumbComponent breadcrumbs={[{ name: 'Tags', href: '/tags' }]} />

<div class="flex flex-col gap-6">
	<CreateTagFormComponent />

	<svelte:boundary>
		{@const tags = await getManagedTags()}

		{#if tags.length === 0}
			<p class="text-sm text-zinc-500">No tags yet. Create your first one above.</p>
		{:else}
			<div class="flex flex-col gap-6">
				{#each TAG_CATEGORY_CONFIG as { key, label } (key)}
					{@const categoryTags = tags.filter((t) => t.category === key)}
					{#if categoryTags.length > 0}
						<section>
							<h2 class="font-fraunces mb-1 text-2xl font-semibold tracking-tight">{label}</h2>
							<ul>
								{#each categoryTags as tag (tag.id)}
									<TagRowComponent {tag} />
								{/each}
							</ul>
						</section>
					{/if}
				{/each}
			</div>
		{/if}

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
