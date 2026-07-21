import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as recipeService from '../services/recipe.service';
import { toToolError, toolResult } from './result';
import { recipeDetailSchema, recipeSummarySchema } from './schemas';
import { serializeDetail, serializeSummary } from './serializers';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

export function registerListRecipes(server: McpServer): void {
	server.registerTool(
		'list_recipes',
		{
			title: 'List recipes',
			description: `List recipes newest first, without ingredients or instructions. Optionally narrow with "search" (matches name and description) and "tags" (recipe must have every tag slug given; discover slugs from the "tags" field in results). Returns at most ${MAX_LIMIT} per call; page through them with "offset". Use "get_recipe" for a recipe's full detail.`,
			inputSchema: {
				search: z
					.string()
					.min(1)
					.max(200)
					.optional()
					.describe('Case-insensitive text to match against a recipe name or description.'),
				tags: z
					.array(z.string().min(1).max(200))
					.max(20)
					.optional()
					.describe(
						'Tag slugs a recipe must all have to match. Discover valid slugs from the "tags" field of previous results.'
					),
				limit: z
					.number()
					.int()
					.min(1)
					.max(MAX_LIMIT)
					.default(DEFAULT_LIMIT)
					.describe(`Maximum recipes to return (1–${MAX_LIMIT}).`),
				offset: z
					.number()
					.int()
					.min(0)
					.default(0)
					.describe('Number of recipes to skip from the start; use with "limit" to page.')
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
		async ({ search, tags, limit, offset }) => {
			try {
				const filter = { search, tags };
				const [items, total] = await Promise.all([
					recipeService.getRecipesMetadata(filter, { limit, offset }),
					recipeService.countRecipes(filter)
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
}

export function registerGetRecipe(server: McpServer, baseUrl: string): void {
	server.registerTool(
		'get_recipe',
		{
			title: 'Get recipe',
			description:
				'Get a single recipe by its slug, including its ingredients and ordered instructions.',
			inputSchema: {
				slug: z
					.string()
					.min(1)
					.max(200)
					.describe('The recipe\'s unique slug, e.g. from the "slug" field of a list result.')
			},
			outputSchema: { recipe: recipeDetailSchema },
			annotations: { readOnlyHint: true, openWorldHint: false }
		},
		async ({ slug }) => {
			try {
				return toolResult({
					recipe: serializeDetail(await recipeService.getRecipeBySlug(slug), baseUrl)
				});
			} catch (err) {
				return toToolError(err);
			}
		}
	);
}
