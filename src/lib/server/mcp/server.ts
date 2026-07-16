import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerRecipeTools } from './tools';

export const MCP_SERVER_NAME = 'rezeptly';
export const MCP_SERVER_VERSION = '1.0.0';

/**
 * Builds a fresh MCP server. Transports carry per-request state, so a new instance must be created
 * per request rather than shared across invocations.
 */
export function createMcpServer(): McpServer {
	const server = new McpServer(
		{ name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION },
		{
			capabilities: { tools: {} },
			instructions:
				'Read-only access to the rezeptly recipe collection. Browse with "list_recipes", discover tags with "list_tags", filter with "search_recipes_by_tag", and fetch full detail with "get_recipe".'
		}
	);

	registerRecipeTools(server);

	return server;
}
