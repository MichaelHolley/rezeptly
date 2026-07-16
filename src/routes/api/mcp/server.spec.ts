import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './+server';

vi.mock('$lib/server/services/recipe.service', () => ({
	getRecipesMetadataPage: vi.fn(),
	getRecipesMetadataByTagSlugs: vi.fn(),
	getRecipeBySlug: vi.fn()
}));

vi.mock('$lib/server/services/tag.service', () => ({
	getAllActiveTags: vi.fn()
}));

const PROTOCOL_VERSION = '2025-06-18';

const rpc = (body: unknown) =>
	new Request('http://localhost/api/mcp', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			accept: 'application/json, text/event-stream'
		},
		body: JSON.stringify(body)
	});

const initializeBody = {
	jsonrpc: '2.0',
	id: 1,
	method: 'initialize',
	params: {
		protocolVersion: PROTOCOL_VERSION,
		capabilities: {},
		clientInfo: { name: 'test', version: '1.0.0' }
	}
};

// The handlers are plain fetch handlers; RequestEvent fields beyond `request` are unused.
const call = (handler: typeof POST, request: Request) =>
	(handler as unknown as (event: { request: Request }) => Promise<Response>)({ request });

describe('POST /api/mcp', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('responds to initialize', async () => {
		const response = await call(POST, rpc(initializeBody));

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.result.serverInfo.name).toBe('rezeptly');
	});

	it('issues no session id, so no state is carried between requests', async () => {
		const response = await call(POST, rpc(initializeBody));

		expect(response.headers.get('mcp-session-id')).toBeNull();
	});

	it('returns JSON rather than an SSE stream', async () => {
		const response = await call(POST, rpc(initializeBody));

		expect(response.headers.get('content-type')).toContain('application/json');
	});

	it('lists the recipe tools without a prior session', async () => {
		const response = await call(
			POST,
			rpc({
				jsonrpc: '2.0',
				id: 2,
				method: 'tools/list',
				params: {}
			})
		);

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.result.tools.map((t: { name: string }) => t.name).sort()).toEqual([
			'get_recipe',
			'list_recipes',
			'list_tags',
			'search_recipes_by_tag'
		]);
	});

	it('rejects a malformed body with a JSON-RPC error', async () => {
		const response = await call(POST, rpc({ jsonrpc: '2.0', id: 3, method: 'nope/missing' }));

		const body = await response.json();
		expect(body.error).toBeDefined();
	});
});

describe('GET /api/mcp', () => {
	it('is not allowed, since stateless mode has no stream to resume', async () => {
		const response = await call(GET, new Request('http://localhost/api/mcp'));

		expect(response.status).toBe(405);
		expect(response.headers.get('allow')).toBe('POST');
	});
});
