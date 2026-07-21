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
}

export function registerGetRecipe(server: McpServer): void {
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
}
