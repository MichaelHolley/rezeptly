import { createMcpServer } from '$lib/server/mcp/server';
import { createMcpHandler } from '@modelcontextprotocol/server';
import type { RequestHandler } from './$types';

export const config = { runtime: 'nodejs22.x' };

const methodNotAllowed = () =>
	new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });

export const POST: RequestHandler = async ({ request, url }) => {
	const handler = createMcpHandler(() => createMcpServer(url.origin), {
		onerror: (err) => console.error('MCP handler error:', err)
	});

	try {
		return await handler.fetch(request);
	} catch (err) {
		console.error('MCP request failed:', err);
		return new Response('Internal Server Error', { status: 500 });
	} finally {
		await handler.close();
	}
};

// Stateless mode has no session to resume or terminate, and the SDK's GET would open an SSE
// stream that never closes.
export const GET: RequestHandler = methodNotAllowed;
export const DELETE: RequestHandler = methodNotAllowed;
