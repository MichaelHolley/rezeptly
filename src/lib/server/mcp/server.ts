import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGetRecipe, registerListRecipes } from './tools';

/**
 * Builds a fresh MCP server. Transports carry per-request state, so a new instance must be created
 * per request rather than shared across invocations.
 */
export function createMcpServer(baseUrl: string): McpServer {
	const server = new McpServer(
		{ name: 'rezeptly', version: '1.1.0' },
		{
			instructions:
				'Read-only access to the rezeptly recipe collection. Browse with "list_recipes", then fetch a recipe\'s full detail with "get_recipe".'
		}
	);

	registerListRecipes(server);
	registerGetRecipe(server, baseUrl);

	return server;
}
