<script lang="ts">
	import { page } from '$app/state';
	import CopyButtonComponent from '$lib/components/common/CopyButtonComponent.svelte';
	import BreadcrumbComponent from '$lib/components/common/navigation/BreadcrumbComponent.svelte';

	const endpoint = $derived(`${page.url.origin}/api/mcp`);

	const config = $derived(`{
  "mcpServers": {
    "rezeptly": {
      "type": "http",
      "url": "${endpoint}"
    }
  }
}`);

	const stdioCommand = $derived(`npx -y mcp-remote ${endpoint}`);

	const tools = [
		{
			name: 'list_recipes',
			description: 'Browse recipes, optionally filtered by search text or tags.'
		},
		{ name: 'list_tags', description: 'List all tags in use, with the slugs used for filtering.' },
		{
			name: 'get_recipe',
			description: 'Read a single recipe by slug, with ingredients and instructions.'
		}
	];
</script>

<svelte:head>
	<title>rezeptly | MCP</title>
</svelte:head>

<BreadcrumbComponent breadcrumbs={[{ name: 'MCP Server', href: '/mcp' }]} />

<div class="flex max-w-3xl flex-col gap-8">
	<section class="flex flex-col gap-2">
		<h2 class="text-2xl font-semibold">MCP Server</h2>
		<p class="text-zinc-600">
			rezeptly exposes its recipes through a
			<a
				href="https://modelcontextprotocol.io"
				target="_blank"
				rel="noreferrer"
				class="underline underline-offset-2">Model Context Protocol</a
			>
			server. Any MCP-capable client can connect to it and read the collection. Access is read-only and
			needs no account or API key.
		</p>
	</section>

	<section class="flex flex-col gap-2">
		<h3 class="text-lg font-semibold">Endpoint</h3>
		<div class="flex flex-row items-center gap-2">
			<code class="flex-1 truncate rounded-sm bg-zinc-100 px-3 py-2 text-sm">{endpoint}</code>
			<CopyButtonComponent value={endpoint} label="Copy endpoint" />
		</div>
		<p class="text-sm text-zinc-500">Transport: Streamable HTTP (POST). No authentication.</p>
	</section>

	<section class="flex flex-col gap-2">
		<h3 class="text-lg font-semibold">Add it to your client</h3>
		<p class="text-zinc-600">
			Most clients let you add a remote server either through their UI — paste the endpoint above —
			or through a configuration file. The file format is largely the same across clients:
		</p>
		<div class="relative">
			<pre class="overflow-x-auto rounded-sm bg-zinc-100 p-3 text-sm"><code>{config}</code></pre>
			<CopyButtonComponent
				value={config}
				label="Copy configuration"
				class="absolute top-2 right-2"
			/>
		</div>
		<p class="text-zinc-600">
			If your client supports local (stdio) servers only, bridge to the endpoint with a proxy:
		</p>
		<div class="flex flex-row items-center gap-2">
			<code class="flex-1 truncate rounded-sm bg-zinc-100 px-3 py-2 text-sm">{stdioCommand}</code>
			<CopyButtonComponent value={stdioCommand} label="Copy command" />
		</div>
		<p class="text-sm text-zinc-500">
			Restart the client after editing its configuration, then check its server list for
			<span class="font-medium">rezeptly</span>.
		</p>
	</section>

	<section class="flex flex-col gap-2">
		<h3 class="text-lg font-semibold">Available tools</h3>
		<ul class="flex flex-col gap-2">
			{#each tools as tool (tool.name)}
				<li class="flex flex-col gap-0.5 rounded-sm border border-zinc-200 px-3 py-2">
					<code class="text-sm font-medium">{tool.name}</code>
					<span class="text-sm text-zinc-600">{tool.description}</span>
				</li>
			{/each}
		</ul>
	</section>
</div>
