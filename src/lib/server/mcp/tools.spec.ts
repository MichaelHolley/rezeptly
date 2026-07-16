import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { error } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as recipeService from '../services/recipe.service';
import * as tagService from '../services/tag.service';
import type { RecipeMetadata, RecipeWithDetails, Tag } from '../types';
import { createMcpServer } from './server';

vi.mock('../services/recipe.service', () => ({
	getRecipesMetadataPage: vi.fn(),
	getRecipesMetadataByTagSlugs: vi.fn(),
	getRecipeBySlug: vi.fn()
}));

vi.mock('../services/tag.service', () => ({
	getAllActiveTags: vi.fn()
}));

const tag: Tag = { id: 7, name: 'Italian', slug: 'italian', category: 'cuisine' };

const metadata: RecipeMetadata = {
	id: 1,
	name: 'Carbonara',
	slug: 'carbonara',
	description: 'Roman classic',
	imageUrl: null,
	durationMinutes: 25,
	portions: 2,
	createdAt: new Date('2026-01-15T10:30:00.000Z'),
	tags: [tag]
};

const detail: RecipeWithDetails = {
	...metadata,
	ingredients: [{ id: 3, name: 'Guanciale', recipeId: 1 }],
	instructions: [
		{ id: 10, heading: null, instructions: 'Dice the guanciale', stepOrder: 1, recipeId: 1 }
	]
};

async function connectClient() {
	const client = new Client({ name: 'test', version: '1.0.0' });
	const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

	await Promise.all([client.connect(clientTransport), createMcpServer().connect(serverTransport)]);

	return client;
}

type StructuredResult = { structuredContent?: Record<string, unknown>; isError?: boolean };

/** The SDK surfaces schema violations as an isError result rather than a rejected call. */
async function expectInvalidParams(result: Promise<unknown>) {
	const resolved = (await result) as StructuredResult;

	expect(resolved.isError).toBe(true);
	expect(JSON.stringify(resolved)).toContain('-32602');
}

describe('MCP recipe tools', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	it('advertises exactly the four read-only tools', async () => {
		const client = await connectClient();

		const { tools } = await client.listTools();

		expect(tools.map((t) => t.name).sort()).toEqual([
			'get_recipe',
			'list_recipes',
			'list_tags',
			'search_recipes_by_tag'
		]);
	});

	describe('list_recipes', () => {
		it('defaults to a limit of 20 and an offset of 0', async () => {
			vi.mocked(recipeService.getRecipesMetadataPage).mockResolvedValue({ items: [], total: 0 });
			const client = await connectClient();

			await client.callTool({ name: 'list_recipes', arguments: {} });

			expect(recipeService.getRecipesMetadataPage).toHaveBeenCalledWith({ limit: 20, offset: 0 });
		});

		it('rejects a limit above the cap of 100', async () => {
			const client = await connectClient();

			await expectInvalidParams(
				client.callTool({ name: 'list_recipes', arguments: { limit: 150 } })
			);

			expect(recipeService.getRecipesMetadataPage).not.toHaveBeenCalled();
		});

		it('rejects a negative offset', async () => {
			const client = await connectClient();

			await expectInvalidParams(
				client.callTool({ name: 'list_recipes', arguments: { offset: -1 } })
			);
		});

		it('reports hasMore when the page does not reach the total', async () => {
			vi.mocked(recipeService.getRecipesMetadataPage).mockResolvedValue({
				items: [metadata],
				total: 25
			});
			const client = await connectClient();

			const result = (await client.callTool({
				name: 'list_recipes',
				arguments: { limit: 1, offset: 0 }
			})) as StructuredResult;

			expect(result.structuredContent).toMatchObject({ total: 25, hasMore: true });
		});

		it('reports hasMore false on the final page', async () => {
			vi.mocked(recipeService.getRecipesMetadataPage).mockResolvedValue({
				items: Array(5).fill(metadata),
				total: 25
			});
			const client = await connectClient();

			const result = (await client.callTool({
				name: 'list_recipes',
				arguments: { limit: 20, offset: 20 }
			})) as StructuredResult;

			expect(result.structuredContent).toMatchObject({ hasMore: false });
		});
	});

	describe('get_recipe', () => {
		it('returns the serialized recipe detail', async () => {
			vi.mocked(recipeService.getRecipeBySlug).mockResolvedValue(detail);
			const client = await connectClient();

			const result = (await client.callTool({
				name: 'get_recipe',
				arguments: { slug: 'carbonara' }
			})) as StructuredResult;

			expect(result.structuredContent?.recipe).toMatchObject({
				slug: 'carbonara',
				ingredients: ['Guanciale']
			});
		});

		it('maps an unknown slug to a tool error carrying the message', async () => {
			vi.mocked(recipeService.getRecipeBySlug).mockImplementation(() => {
				throw error(404, { message: 'Recipe with slug nope not found', code: 'NOT_FOUND' });
			});
			const client = await connectClient();

			const result = (await client.callTool({
				name: 'get_recipe',
				arguments: { slug: 'nope' }
			})) as StructuredResult;

			expect(result.isError).toBe(true);
			expect(JSON.stringify(result)).toContain('Recipe with slug nope not found');
		});

		it('does not leak an unexpected error to the client', async () => {
			vi.mocked(recipeService.getRecipeBySlug).mockRejectedValue(
				new Error('postgres://user:pw@host unreachable')
			);
			const client = await connectClient();

			const result = (await client.callTool({
				name: 'get_recipe',
				arguments: { slug: 'carbonara' }
			})) as StructuredResult;

			expect(result.isError).toBe(true);
			expect(JSON.stringify(result)).not.toContain('postgres://');
		});

		it('rejects an empty slug', async () => {
			const client = await connectClient();

			await expectInvalidParams(client.callTool({ name: 'get_recipe', arguments: { slug: '' } }));

			expect(recipeService.getRecipeBySlug).not.toHaveBeenCalled();
		});
	});

	describe('list_tags', () => {
		it('returns active tags with their total', async () => {
			vi.mocked(tagService.getAllActiveTags).mockResolvedValue([tag]);
			const client = await connectClient();

			const result = (await client.callTool({ name: 'list_tags' })) as StructuredResult;

			expect(result.structuredContent).toEqual({
				tags: [{ name: 'Italian', slug: 'italian', category: 'cuisine' }],
				total: 1
			});
		});
	});

	describe('search_recipes_by_tag', () => {
		it('defaults matchAll to false', async () => {
			vi.mocked(recipeService.getRecipesMetadataByTagSlugs).mockResolvedValue({
				items: [],
				total: 0
			});
			const client = await connectClient();

			await client.callTool({
				name: 'search_recipes_by_tag',
				arguments: { tagSlugs: ['italian'] }
			});

			expect(recipeService.getRecipesMetadataByTagSlugs).toHaveBeenCalledWith({
				tagSlugs: ['italian'],
				matchAll: false,
				limit: 20,
				offset: 0
			});
		});

		it('passes matchAll through', async () => {
			vi.mocked(recipeService.getRecipesMetadataByTagSlugs).mockResolvedValue({
				items: [metadata],
				total: 1
			});
			const client = await connectClient();

			await client.callTool({
				name: 'search_recipes_by_tag',
				arguments: { tagSlugs: ['italian', 'vegan'], matchAll: true }
			});

			expect(recipeService.getRecipesMetadataByTagSlugs).toHaveBeenCalledWith(
				expect.objectContaining({ matchAll: true, tagSlugs: ['italian', 'vegan'] })
			);
		});

		it('requires at least one tag slug', async () => {
			const client = await connectClient();

			await expectInvalidParams(
				client.callTool({ name: 'search_recipes_by_tag', arguments: { tagSlugs: [] } })
			);
		});

		it('rejects more than 10 tag slugs', async () => {
			const client = await connectClient();

			await expectInvalidParams(
				client.callTool({
					name: 'search_recipes_by_tag',
					arguments: { tagSlugs: Array.from({ length: 11 }, (_, i) => `tag-${i}`) }
				})
			);

			expect(recipeService.getRecipesMetadataByTagSlugs).not.toHaveBeenCalled();
		});
	});
});
