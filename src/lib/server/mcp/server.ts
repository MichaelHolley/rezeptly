import { McpServer } from '@modelcontextprotocol/server';
import { registerGetRecipe, registerListRecipes, registerListTags } from './tools';

/**
 * Builds a fresh MCP server. Transports carry per-request state, so a new instance must be created
 * per request rather than shared across invocations.
 */
export function createMcpServer(baseUrl: string): McpServer {
	const server = new McpServer(
		{
			name: 'rezeptly',
			title: 'rezeptly',
			version: '1.4.0',
			websiteUrl: baseUrl,
			description: 'Browse and read recipes from a rezeptly collection.',
			icons: [{ src: `${baseUrl}/favicon.svg`, mimeType: 'image/svg+xml', sizes: ['any'] }]
		},
		{
			instructions:
				'Read-only access to the rezeptly recipe collection. Browse with "list_recipes", optionally narrowing by search text or tags. Call "list_tags" first to discover valid tag slugs for filtering. Fetch a recipe\'s full detail with "get_recipe".'
		}
	);

	registerListRecipes(server);
	registerListTags(server);
	registerGetRecipe(server, baseUrl);

	return server;
}
