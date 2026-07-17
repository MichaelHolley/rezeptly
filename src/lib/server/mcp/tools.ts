import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TAG_CATEGORIES } from '$lib/shared/tags';
import { isHttpError } from '@sveltejs/kit';
import { z } from 'zod';
import * as recipeService from '../services/recipe.service';
import type { RecipeMetadata, RecipeWithDetails, Tag, TagCategory } from '../types';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const GENERIC_ERROR = 'An unexpected error occurred while handling the request.';

const tagSchema = z.object({
	name: z.string(),
	slug: z.string(),
	category: z.enum(TAG_CATEGORIES as [TagCategory, ...TagCategory[]])
});

const recipeSummarySchema = z.object({
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	imageUrl: z.string().nullable(),
	durationMinutes: z.number().nullable(),
	portions: z.number().nullable(),
	createdAt: z.string().nullable(),
	tags: z.array(tagSchema)
});

const recipeDetailSchema = recipeSummarySchema.extend({
	ingredients: z.array(z.string()),
	instructions: z.array(
		z.object({
			heading: z.string().nullable(),
			instructions: z.string(),
			stepOrder: z.number()
		})
	)
});

/** Internal row ids are omitted; `slug` is the public handle for a recipe. */
const serializeSummary = (recipe: RecipeMetadata): z.infer<typeof recipeSummarySchema> => ({
	slug: recipe.slug,
	name: recipe.name,
	description: recipe.description,
	imageUrl: recipe.imageUrl,
	durationMinutes: recipe.durationMinutes,
	portions: recipe.portions,
	createdAt: recipe.createdAt?.toISOString() ?? null,
	tags: recipe.tags.map((t: Tag) => ({ name: t.name, slug: t.slug, category: t.category }))
});

const serializeDetail = (recipe: RecipeWithDetails): z.infer<typeof recipeDetailSchema> => ({
	...serializeSummary(recipe),
	ingredients: recipe.ingredients.map((i) => i.name),
	instructions: recipe.instructions.map((i) => ({
		heading: i.heading,
		instructions: i.instructions,
		stepOrder: i.stepOrder
	}))
});

/** Wraps structured output in the text block non-structured clients read. */
const toolResult = <T extends object>(structuredContent: T) => ({
	structuredContent,
	content: [{ type: 'text' as const, text: JSON.stringify(structuredContent, null, 2) }]
});

/**
 * Maps a thrown service error to an MCP tool result. Client-side failures (4xx `HttpError`, e.g. an
 * unknown slug) keep their message so the model can recover; anything else is logged and replaced
 * with a generic message to avoid leaking internals over a public endpoint.
 */
export function toToolError(err: unknown) {
	if (isHttpError(err) && err.status < 500) {
		return { isError: true as const, content: [{ type: 'text' as const, text: err.body.message }] };
	}

	console.error('MCP tool error:', err);
	return { isError: true as const, content: [{ type: 'text' as const, text: GENERIC_ERROR }] };
}

/**
 * Builds a fresh MCP server. Transports carry per-request state, so a new instance must be created
 * per request rather than shared across invocations.
 */
export function createMcpServer(): McpServer {
	const server = new McpServer(
		{ name: 'rezeptly', version: '1.0.0' },
		{
			instructions:
				'Read-only access to the rezeptly recipe collection. Browse with "list_recipes", then fetch a recipe\'s full detail with "get_recipe".'
		}
	);

	server.registerTool(
		'list_recipes',
		{
			title: 'List recipes',
			description: `List recipes newest first, without ingredients or instructions. Returns at most ${MAX_LIMIT} per call; page through them with "offset". Use "get_recipe" for a recipe's full detail.`,
			inputSchema: {
				limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
				offset: z.number().int().min(0).default(0)
			},
			outputSchema: {
				recipes: z.array(recipeSummarySchema),
				total: z.number(),
				limit: z.number(),
				offset: z.number(),
				hasMore: z.boolean()
			},
			annotations: { readOnlyHint: true, openWorldHint: false }
		},
		async ({ limit, offset }) => {
			try {
				const [items, total] = await Promise.all([
					recipeService.getRecipesMetadata({ limit, offset }),
					recipeService.countRecipes()
				]);

				return toolResult({
					recipes: items.map(serializeSummary),
					total,
					limit,
					offset,
					hasMore: offset + items.length < total
				});
			} catch (err) {
				return toToolError(err);
			}
		}
	);

	server.registerTool(
		'get_recipe',
		{
			title: 'Get recipe',
			description:
				'Get a single recipe by its slug, including its ingredients and ordered instructions.',
			inputSchema: { slug: z.string().min(1).max(200) },
			outputSchema: { recipe: recipeDetailSchema },
			annotations: { readOnlyHint: true, openWorldHint: false }
		},
		async ({ slug }) => {
			try {
				return toolResult({ recipe: serializeDetail(await recipeService.getRecipeBySlug(slug)) });
			} catch (err) {
				return toToolError(err);
			}
		}
	);

	return server;
}
