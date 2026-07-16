import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as recipeService from '../services/recipe.service';
import * as tagService from '../services/tag.service';
import type { PaginatedRecipeMetadata, TagCategory } from '../types';
import { toToolError } from './errors';
import { serializeRecipeDetail, serializeRecipeSummary, serializeTag } from './serialize';
import { TAG_CATEGORIES } from '$lib/shared/tags';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const MAX_TAG_SLUGS = 10;

const limitSchema = z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT);
const offsetSchema = z.number().int().min(0).default(0);

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

const recipePageOutputShape = {
	recipes: z.array(recipeSummarySchema),
	total: z.number(),
	limit: z.number(),
	offset: z.number(),
	hasMore: z.boolean()
};

/** Wraps structured output in the text block non-structured clients read. */
const toolResult = <T extends object>(structuredContent: T) => ({
	structuredContent,
	content: [{ type: 'text' as const, text: JSON.stringify(structuredContent, null, 2) }]
});

const toRecipePage = (page: PaginatedRecipeMetadata, limit: number, offset: number) =>
	toolResult({
		recipes: page.items.map(serializeRecipeSummary),
		total: page.total,
		limit,
		offset,
		hasMore: offset + page.items.length < page.total
	});

export function registerRecipeTools(server: McpServer): void {
	server.registerTool(
		'list_recipes',
		{
			title: 'List recipes',
			description: `List recipes newest first, without ingredients or instructions. Returns at most ${MAX_LIMIT} per call; page through them with "offset". Use "get_recipe" for a recipe's full detail.`,
			inputSchema: { limit: limitSchema, offset: offsetSchema },
			outputSchema: recipePageOutputShape,
			annotations: { readOnlyHint: true, openWorldHint: false }
		},
		async ({ limit, offset }) => {
			try {
				const page = await recipeService.getRecipesMetadataPage({ limit, offset });
				return toRecipePage(page, limit, offset);
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

	server.registerTool(
		'list_tags',
		{
			title: 'List tags',
			description:
				'List every tag currently applied to at least one recipe. Use the returned slugs with "search_recipes_by_tag".',
			outputSchema: { tags: z.array(tagSchema), total: z.number() },
			annotations: { readOnlyHint: true, openWorldHint: false }
		},
		async () => {
			try {
				const tags = await tagService.getAllActiveTags();
				return toolResult({ tags: tags.map(serializeTag), total: tags.length });
			} catch (err) {
				return toToolError(err);
			}
		}
	);

	server.registerTool(
		'search_recipes_by_tag',
		{
			title: 'Search recipes by tag',
			description: `Find recipes by tag slug. By default a recipe matches any of the given slugs; set "matchAll" to require all of them. Returns at most ${MAX_LIMIT} per call.`,
			inputSchema: {
				tagSlugs: z.array(z.string().min(1)).min(1).max(MAX_TAG_SLUGS),
				matchAll: z.boolean().default(false),
				limit: limitSchema,
				offset: offsetSchema
			},
			outputSchema: recipePageOutputShape,
			annotations: { readOnlyHint: true, openWorldHint: false }
		},
		async ({ tagSlugs, matchAll, limit, offset }) => {
			try {
				const page = await recipeService.getRecipesMetadataByTagSlugs({
					tagSlugs,
					matchAll,
					limit,
					offset
				});
				return toRecipePage(page, limit, offset);
			} catch (err) {
				return toToolError(err);
			}
		}
	);
}
