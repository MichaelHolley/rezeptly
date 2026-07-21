import { createMcpServer } from '$lib/server/mcp/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import type { RequestHandler } from './$types';

export const config = { runtime: 'nodejs22.x' };

const methodNotAllowed = () =>
	new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });

export const POST: RequestHandler = async ({ request }) => {
	const server = createMcpServer();
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
		enableJsonResponse: true
	});

	await server.connect(transport);
	request.signal.addEventListener('abort', () => void server.close());

	try {
		return await transport.handleRequest(request);
	} catch (err) {
		console.error('MCP request failed:', err);
		await server.close();
		return new Response('Internal Server Error', { status: 500 });
	}
};

// Stateless mode has no session to resume or terminate, and the SDK's GET would open an SSE
// stream that never closes.
export const GET: RequestHandler = methodNotAllowed;
export const DELETE: RequestHandler = methodNotAllowed;
