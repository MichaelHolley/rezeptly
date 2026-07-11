import { env } from '$env/dynamic/private';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, Output } from 'ai';
import { z } from 'zod';

const extractionSchema = z.object({
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

export async function extractRecipeFromImage(file: File): Promise<ExtractedRecipeData> {
	const apiKey = env.OPENROUTER_API_KEY;
	const modelName = env.OPENROUTER_MODEL_NAME;

	if (!apiKey || !modelName) {
		return { ingredients: [], instructions: [] };
	}

	const openrouter = createOpenRouter({ apiKey });
	const arrayBuffer = await file.arrayBuffer();
	const base64 = Buffer.from(arrayBuffer).toString('base64');

	const { output } = await generateText({
		model: openrouter.chat(modelName),
		output: Output.object({
			schema: extractionSchema
		}),
		system:
			'You are a recipe parser. Extract ingredients and cooking instructions from recipe images. Return empty arrays if the information is not visible or unclear in the image. Ingredient-values must include both amount and title. Fix typos. For instruction section headings: never use step numbers (e.g. "Step 1", "1.", "Schritt 1") as the heading — instead derive a short descriptive title that summarises the action (e.g. "Teig kneten", "Prepare the dough", "Faire revenir les oignons"). Keep the heading in the original language of the recipe. If the ingredients list is grouped, it is recommended to write the list of ingredients again to the according step without their amount.',
		messages: [
			{
				role: 'user',
				content: [
					{
						type: 'image',
						image: base64
					},
					{ type: 'text', text: 'Extract all ingredients and instructions from this recipe image.' }
				]
			}
		]
	});

	return output;
}
