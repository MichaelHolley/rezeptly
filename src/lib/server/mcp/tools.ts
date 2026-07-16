import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TAG_CATEGORIES } from '$lib/shared/tags';
import { z } from 'zod';
import * as recipeService from '../services/recipe.service';
import type { TagCategory } from '../types';
import { toToolError } from './errors';
import { serializeRecipeDetail, serializeRecipeSummary } from './serialize';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

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

/** Wraps structured output in the text block non-structured clients read. */
const toolResult = <T extends object>(structuredContent: T) => ({
	structuredContent,
	content: [{ type: 'text' as const, text: JSON.stringify(structuredContent, null, 2) }]
});

export function registerRecipeTools(server: McpServer): void {
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
				const page = await recipeService.getRecipesMetadataPage({ limit, offset });

				return toolResult({
					recipes: page.items.map(serializeRecipeSummary),
					total: page.total,
					limit,
					offset,
					hasMore: offset + page.items.length < page.total
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
				const recipe = await recipeService.getRecipeBySlug(slug);

				return toolResult({ recipe: serializeRecipeDetail(recipe) });
			} catch (err) {
				return toToolError(err);
			}
		}
	);
}
