import { env } from '$env/dynamic/private';
import { recipeIdSchema } from '$lib/api/schemas';
import {
	assistantDetailsProposalSchema,
	assistantIngredientProposalSchema,
	assistantInstructionProposalSchema,
	detailsProposalIsStale,
	listProposalIsStale,
	type AssistantDetailsState,
	type AssistantInstruction,
	type RecipeAssistantMessage
} from '$lib/shared/recipe-assistant';
import { COURSES, type RecipeCourse } from '$lib/shared/course';
import { TAG_CATEGORIES } from '$lib/shared/tags';
import { userCanWrite } from '$lib/server/auth/permissions';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
	convertToModelMessages,
	generateText,
	Output,
	isStepCount,
	streamText,
	tool,
	validateUIMessages
} from 'ai';
import { z } from 'zod';
import type { RecipeId, RecipeWithDetails, Tag, TagCategory } from '../types';
import * as ingredientService from './ingredient.service';
import * as instructionService from './instruction.service';
import * as recipeService from './recipe.service';

export const aiEnabled = (): boolean =>
	Boolean(env.OPENROUTER_API_KEY) && Boolean(env.OPENROUTER_MODEL_NAME);

const tagCategorySchema = z.enum(TAG_CATEGORIES as [TagCategory, ...TagCategory[]]);

const tagProposalSchema = z.object({
	category: tagCategorySchema.describe('The category the tag belongs to'),
	name: z.string().describe('The exact name of an existing tag')
});

export type TagProposal = z.infer<typeof tagProposalSchema>;

const extractionSchema = z.object({
	isRecipe: z
		.boolean()
		.describe('Whether the image actually shows a recipe. False for anything else.'),
	name: z.string().describe('The name of the recipe'),
	description: z.string().describe('A short summary of the dish, at most two sentences'),
	course: z
		.enum(COURSES)
		.nullable()
		.describe('The position of the dish in a meal, or null if not obvious'),
	durationMinutes: z
		.number()
		.nullable()
		.describe('Total time needed in minutes, or null if not stated'),
	portions: z.number().nullable().describe('Number of portions, or null if not stated'),
	tags: z.array(tagProposalSchema).describe('Tags chosen from the provided vocabulary'),
	ingredients: z.array(
		z
			.object({
				name: z
					.string()
					.describe(
						"A single recipe ingredient. Must include both amount and title (e.g. '150g Mehl'"
					)
			})
			.describe('The list of recipe ingredients')
	),
	instructions: z
		.array(
			z
				.object({
					heading: z.string().describe('The heading of the instruction section'),
					instructions: z.string().describe('The description of the instruction section')
				})
				.describe('One Section of the recipe instructions')
		)
		.describe('The list of recipe instructions segments')
});

export type ExtractedRecipeData = z.infer<typeof extractionSchema>;

const EMPTY_EXTRACTION: ExtractedRecipeData = {
	isRecipe: false,
	name: '',
	description: '',
	course: null,
	durationMinutes: null,
	portions: null,
	tags: [],
	ingredients: [],
	instructions: []
};

const SYSTEM_PROMPT = [
	'You are a recipe parser. Extract a complete recipe from the image.',
	'If the image does not show a recipe, set isRecipe to false and leave every other field empty — never invent a recipe.',
	"Name and description are required: if the page does not show them, write them yourself based on the dish, in the recipe's original language. The description is a short summary of the dish, never a copy of the instructions.",
	'Every other value is optional: return null or an empty array when it is not visible or unclear. Never guess a duration, a portion count or a tag.',
	'durationMinutes is the total time in minutes. portions is a plain count of servings.',
	'course is the position of the dish in a meal; return null when it is not obvious.',
	'Ingredient-values must include both amount and title. Fix typos.',
	'For instruction section headings: never use step numbers (e.g. "Step 1", "1.", "Schritt 1") as the heading — instead derive a short descriptive title that summarises the action (e.g. "Teig kneten", "Prepare the dough", "Faire revenir les oignons"). Keep the heading in the original language of the recipe.',
	'If the ingredients list is grouped, it is recommended to write the list of ingredients again to the according step without their amount.'
].join(' ');

function buildTagVocabularyPrompt(existingTags: Tag[]): string {
	const byCategory = TAG_CATEGORIES.map((category) => {
		const names = existingTags.filter((tag) => tag.category === category).map((tag) => tag.name);
		return `${category}: ${names.length ? names.join(', ') : '(none)'}`;
	}).join('\n');

	return [
		'Choose tags only from this vocabulary, copying a name exactly as written.',
		'Never invent a tag that is not listed. Leave a category out entirely when nothing listed fits.',
		byCategory
	].join('\n');
}

export async function extractRecipeFromImage(
	file: File,
	existingTags: Tag[] = []
): Promise<ExtractedRecipeData> {
	const apiKey = env.OPENROUTER_API_KEY;
	const modelName = env.OPENROUTER_MODEL_NAME;

	if (!apiKey || !modelName) {
		return EMPTY_EXTRACTION;
	}

	const openrouter = createOpenRouter({ apiKey });
	const arrayBuffer = await file.arrayBuffer();
	const base64 = Buffer.from(arrayBuffer).toString('base64');

	const { output } = await generateText({
		model: openrouter.chat(modelName),
		output: Output.object({
			schema: extractionSchema
		}),
		instructions: `${SYSTEM_PROMPT}\n\n${buildTagVocabularyPrompt(existingTags)}`,
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'file',
						data: base64,
						mediaType: 'image'
					}
				]
			}
		]
	});

	return output;
}

export type RecipeTagContext = {
	name: string;
	description: string | null;
	course: RecipeCourse | null;
	ingredientNames: string[];
	instructionHeadings: string[];
};

const TAG_SUGGESTION_SYSTEM_PROMPT = [
	'You suggest tags for a recipe, picking only from an existing tag vocabulary.',
	'Propose at most a handful of tags per category. Prefer proposing nothing over guessing.',
	'Leave a category out entirely when nothing listed fits.'
].join(' ');

function buildRecipeContextPrompt(recipe: RecipeTagContext): string {
	return [
		`Name: ${recipe.name}`,
		`Description: ${recipe.description ?? '(none)'}`,
		`Course: ${recipe.course ?? '(none)'}`,
		`Ingredients: ${recipe.ingredientNames.join(', ') || '(none)'}`,
		`Instruction section headings: ${recipe.instructionHeadings.join(', ') || '(none)'}`
	].join('\n');
}

export async function suggestRecipeTags(
	recipe: RecipeTagContext,
	existingTags: Tag[] = []
): Promise<TagProposal[]> {
	const apiKey = env.OPENROUTER_API_KEY;
	const modelName = env.OPENROUTER_MODEL_NAME;

	if (!apiKey || !modelName) {
		return [];
	}

	const openrouter = createOpenRouter({ apiKey });

	const { output } = await generateText({
		model: openrouter.chat(modelName),
		output: Output.object({
			schema: z.object({ tags: z.array(tagProposalSchema) })
		}),
		instructions: `${TAG_SUGGESTION_SYSTEM_PROMPT}\n\n${buildTagVocabularyPrompt(existingTags)}`,
		messages: [
			{
				role: 'user',
				content: buildRecipeContextPrompt(recipe)
			}
		]
	});

	return output.tags;
}

const ASSISTANT_SYSTEM_PROMPT = [
	'You are a focused assistant for the draft recipe supplied below.',
	'Answer questions about this recipe and closely related cooking topics, and politely decline unrelated requests.',
	'Reply in the language used by the writer. Keep recipe content in its current language unless the writer explicitly asks for a translation.',
	'Only call a mutation tool when the writer explicitly asks to change the recipe. Advice, review, questions, and discussion are not mutation intent.',
	'Ask a clarifying question when ambiguity could materially change the recipe. Use reasonable defaults for harmless wording and formatting choices.',
	'Each tool call proposes a change and requires the writer to approve it. Never claim a proposal has already been applied.',
	'Call each tool at most once per writer message. After a proposal is rejected, do not propose it again without a new explicit writer request.',
	'For details, include only changed fields and copy each current value exactly into from.',
	'For ingredients and instructions, expected must be an exact copy of the complete current list and replacement must be the complete desired list.'
].join(' ');

function detailsState(recipe: RecipeWithDetails): AssistantDetailsState {
	return {
		name: recipe.name,
		description: recipe.description,
		course: recipe.course,
		durationMinutes: recipe.durationMinutes,
		portions: recipe.portions
	};
}

function instructionState(recipe: RecipeWithDetails): AssistantInstruction[] {
	return recipe.instructions.map(({ heading, instructions }) => ({
		heading: heading?.trim() || null,
		instructions
	}));
}

function recipeContext(recipe: RecipeWithDetails): string {
	return JSON.stringify({
		details: detailsState(recipe),
		tags: recipe.tags.map(({ name, category }) => ({ name, category })),
		ingredients: recipe.ingredients.map(({ name }) => name),
		instructions: instructionState(recipe)
	});
}

async function currentDraft(recipeId: RecipeId): Promise<RecipeWithDetails | null> {
	if (!userCanWrite()) return null;
	const recipe = await recipeService.getRecipeById(recipeId, { includeDrafts: true });
	return recipe.publishedAt == null ? recipe : null;
}

function toolResult(recipe: RecipeWithDetails) {
	return { status: 'applied' as const, recipe: { id: recipe.id, slug: recipe.slug } };
}

async function safeToolExecution<T>(operation: () => Promise<T>) {
	try {
		return await operation();
	} catch (error) {
		console.error('Recipe assistant tool failed', error);
		return {
			status: 'failed' as const,
			message: 'The proposed change could not be applied. Please request a fresh proposal.'
		};
	}
}

export function createRecipeAssistantTools(recipeId: RecipeId) {
	return {
		updateDetails: tool({
			description:
				'Propose changes to one or more recipe detail fields. Use only after an explicit request to change them.',
			inputSchema: assistantDetailsProposalSchema,
			needsApproval: true,
			execute: (proposal) =>
				safeToolExecution(async () => {
					const recipe = await currentDraft(recipeId);
					if (!recipe)
						return { status: 'unavailable' as const, message: 'This recipe is no longer a draft.' };
					if (detailsProposalIsStale(detailsState(recipe), proposal)) {
						return {
							status: 'stale' as const,
							message: 'The affected recipe details changed after this proposal was created.'
						};
					}

					const changes = Object.fromEntries(
						Object.entries(proposal).map(([field, change]) => [field, change.to])
					);
					await recipeService.updateRecipe(recipeId, changes);
					return toolResult(await recipeService.getRecipeById(recipeId, { includeDrafts: true }));
				})
		}),
		replaceIngredients: tool({
			description:
				'Propose replacing the complete ingredient list. Use only after an explicit request to change ingredients.',
			inputSchema: assistantIngredientProposalSchema,
			needsApproval: true,
			execute: ({ expected, replacement }) =>
				safeToolExecution(async () => {
					const recipe = await currentDraft(recipeId);
					if (!recipe)
						return { status: 'unavailable' as const, message: 'This recipe is no longer a draft.' };
					if (
						listProposalIsStale(
							recipe.ingredients.map(({ name }) => name),
							expected
						)
					) {
						return {
							status: 'stale' as const,
							message: 'The ingredient list changed after this proposal was created.'
						};
					}

					await ingredientService.replaceIngredientsForRecipe(recipeId, replacement);
					return toolResult(await recipeService.getRecipeById(recipeId, { includeDrafts: true }));
				})
		}),
		replaceInstructions: tool({
			description:
				'Propose replacing the complete ordered instruction list. Use only after an explicit request to change instructions.',
			inputSchema: assistantInstructionProposalSchema,
			needsApproval: true,
			execute: ({ expected, replacement }) =>
				safeToolExecution(async () => {
					const recipe = await currentDraft(recipeId);
					if (!recipe)
						return { status: 'unavailable' as const, message: 'This recipe is no longer a draft.' };
					if (listProposalIsStale(instructionState(recipe), expected)) {
						return {
							status: 'stale' as const,
							message: 'The instruction list changed after this proposal was created.'
						};
					}

					await instructionService.upsertInstructionsForRecipe(
						recipeId,
						replacement.map((instruction, index) => ({
							...instruction,
							stepOrder: index + 1,
							recipeId
						}))
					);
					return toolResult(await recipeService.getRecipeById(recipeId, { includeDrafts: true }));
				})
		})
	};
}

export async function streamRecipeAssistant(
	recipe: RecipeWithDetails,
	messages: unknown
): Promise<Response> {
	const apiKey = env.OPENROUTER_API_KEY;
	const modelName = env.OPENROUTER_MODEL_NAME;
	const approvalSecret = env.JWT_SECRET;
	if (!apiKey || !modelName || !approvalSecret)
		throw new Error('Recipe assistant is not configured');

	const tools = createRecipeAssistantTools(recipeIdSchema.parse(recipe.id));
	const validatedMessages = await validateUIMessages<RecipeAssistantMessage>({ messages, tools });
	if (validatedMessages.some((message) => message.role === 'system')) {
		throw new Error('System messages are not accepted');
	}
	const result = streamText({
		model: createOpenRouter({ apiKey }).chat(modelName),
		instructions: `${ASSISTANT_SYSTEM_PROMPT}\n\nCurrent recipe data:\n${recipeContext(recipe)}`,
		messages: await convertToModelMessages(validatedMessages, { tools }),
		tools,
		stopWhen: isStepCount(5),
		maxOutputTokens: 1200,
		experimental_toolApprovalSecret: approvalSecret
	});

	return result.toUIMessageStreamResponse({
		onError: () => 'The assistant could not complete that response. Please try again.'
	});
}
