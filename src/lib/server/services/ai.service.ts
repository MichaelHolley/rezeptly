import { env } from '$env/dynamic/private';
import { COURSES } from '$lib/shared/course';
import { TAG_CATEGORIES } from '$lib/shared/tags';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import type { Tag, TagCategory } from '../types';

export const imageImportEnabled = (): boolean =>
	Boolean(env.OPENROUTER_API_KEY) && Boolean(env.OPENROUTER_MODEL_NAME);

const tagCategorySchema = z.enum(TAG_CATEGORIES as [TagCategory, ...TagCategory[]]);

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
	tags: z
		.array(
			z.object({
				category: tagCategorySchema.describe('The category the tag belongs to'),
				name: z.string().describe('The exact name of an existing tag')
			})
		)
		.describe('Tags chosen from the provided vocabulary'),
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
		system: `${SYSTEM_PROMPT}\n\n${buildTagVocabularyPrompt(existingTags)}`,
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'image',
						image: base64
					}
				]
			}
		]
	});

	return output;
}
