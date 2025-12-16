<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/';
	import z from 'zod';

	type Breadcrumb = z.infer<typeof BreadcrumbSchema>;
	const BreadcrumbSchema = z.object({
		name: z.string(),
		href: z.string().optional()
	});

	const { breadcrumbs }: { breadcrumbs?: Breadcrumb[] } = $props();
</script>

<Breadcrumb.Root class="mb-4">
	<Breadcrumb.List>
		<Breadcrumb.Item>
			<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
		</Breadcrumb.Item>
		{#each breadcrumbs as crumb (crumb.name)}
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href={crumb.href} class="max-w-xs">
					<p class="truncate">{crumb.name}</p>
				</Breadcrumb.Link>
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
