<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/';

	const { breadcrumbs } = $props<{ breadcrumbs?: { name: string; href?: string }[] }>();
</script>

<Breadcrumb.Root class="mb-4">
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
		</Breadcrumb.Item>
		{#each breadcrumbs as crumb}
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href={crumb.href} class="max-w-xs">
					<p class="truncate">{crumb.name}</p>
				</Breadcrumb.Link>
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
